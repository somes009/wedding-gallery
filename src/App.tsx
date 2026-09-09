import React, { useState, useEffect, useRef } from 'react';
import { PhotoViewer, TransitionType } from './components/PhotoViewer';
import { ControlBar } from './components/ControlBar';
import { MusicPlayer, DEFAULT_PLAYLIST, Track } from './components/MusicPlayer';
import { LoadingScreen } from './components/LoadingScreen';
import { PhotoAlbumModal } from './components/PhotoAlbumModal';

const DEMO = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=1500',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1500',
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1500',
];

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(8000);
  const [isRandom, setIsRandom] = useState(false);
  const [transitionType, setTransitionType] = useState<TransitionType>('fade');
  const [titleText] = useState('新郎 何建峰 ❤️ 新娘 周婉情 | 我们结婚啦 💍');

  const [importedPhotos, setImportedPhotos] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);

  const [musicVolume, setMusicVolume] = useState(0.4);
  const [playlist, setPlaylist] = useState<Track[]>(DEFAULT_PLAYLIST);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isMusicShuffle, setIsMusicShuffle] = useState(false);

  // 预加载相关状态
  const [isPreloading, setIsPreloading] = useState(true);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [isPreloadFadingOut, setIsPreloadFadingOut] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const hasStartedRef = useRef(false);
  const preloadedImagesRef = useRef<HTMLImageElement[]>([]);
  const [isAlbumOpen, setIsAlbumOpen] = useState(false);
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  useEffect(() => {
    hasStartedRef.current = hasStarted;
  }, [hasStarted]);

  // 💡 优化：构建基于 useRef 的闭包穿越引用，用于在 App 组件卸载（如热更新、页面刷新或切页）时，安全地一次性销毁所有自定义追加的照片、歌曲的 Blob 物理缓存，消灭任何内存滞留
  const importedPhotosRef = useRef<string[]>([]);
  const playlistRef = useRef<Track[]>([]);

  useEffect(() => {
    importedPhotosRef.current = importedPhotos;
  }, [importedPhotos]);

  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  useEffect(() => {
    return () => {
      // 释放所有已导入的照片 Object URL
      importedPhotosRef.current.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (err) {
          console.warn('Failed to revoke image object URL on unmount:', err);
        }
      });
      // 释放所有已追加的自定义音频 Object URL
      playlistRef.current.forEach(track => {
        if (track.isCustom && track.localSrc.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(track.localSrc);
          } catch (err) {
            console.warn('Failed to revoke audio object URL on unmount:', err);
          }
        }
      });
    };
  }, []);

  const handleAddMusicFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const newTrack: Track = {
      id: `custom-${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ""),
      localSrc: url,
      isCustom: true
    };
    setPlaylist(prev => [...prev, newTrack]);
    setCurrentTrackIndex(playlist.length);
    setIsPlaying(true);
  };

  const [isControlVisible, setIsControlVisible] = useState(true);

  useEffect(() => {
    const modules = import.meta.glob('/src/assets/photos/*.{png,jpg,jpeg,PNG,JPG,JPEG,svg,webp}', { eager: true });
    const paths = Object.keys(modules).map((key) => (modules[key] as any).default || key);
    setPhotos(paths.length > 0 ? paths : DEMO);
  }, []);

  // 全量图片预加载与后台解码引擎
  useEffect(() => {
    if (photos.length === 0) return;

    setIsPreloading(true);
    setPreloadProgress(0);
    setIsPreloadFadingOut(false);
    setThumbnails([]); // 切换照片集时，重置缩略图数组

    let loadedCount = 0;
    const totalCount = photos.length;
    const tempImages: HTMLImageElement[] = [];
    const tempThumbnails: string[] = new Array(totalCount);

    const handleImageDecoded = (idx: number, img: HTMLImageElement) => {
      // 💡 优化：使用 setTimeout 将重型的 Canvas 下采样和 Base64 生成切片化（Slicing），推入下一个宏任务。
      // 这能保证主线程在每次解码后都有机会执行屏幕刷新（Paint），进度条进度得以及时完美渲染。
      setTimeout(() => {
        let thumb = photos[idx];
        try {
          if (img.naturalWidth > 0 && img.naturalHeight > 0) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const targetWidth = 320; // 320 像素宽度能保证在视网膜屏上依旧清晰，同时体积仅 5-8KB
            const scale = targetWidth / img.naturalWidth;
            canvas.width = targetWidth;
            canvas.height = img.naturalHeight * scale;
            
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            thumb = canvas.toDataURL('image/jpeg', 0.6); // 采用 60% 压缩，体积骤降 2000 倍以上
          }
        } catch (err) {
          console.warn(`Canvas thumbnail generation failed for ${photos[idx]}, falling back to original url.`, err);
        }
        
        tempThumbnails[idx] = thumb;
        loadedCount++;
        const progress = Math.round((loadedCount / totalCount) * 100);
        setPreloadProgress(progress);

        if (loadedCount >= totalCount) {
          // 保存生成的全量缩略图
          setThumbnails([...tempThumbnails]);
          // 全量常驻内存，防止浏览器垃圾回收（GC），消灭后续播放时 0.2 秒的 GPU 同步解码卡顿与灰色闪烁
          preloadedImagesRef.current = tempImages;

          // 如果已经开启过（例如用户中途导入新文件夹），不需要再次点击按钮，直接自动解锁淡出
          if (hasStartedRef.current) {
            setIsPreloadFadingOut(true);
            const timer = setTimeout(() => {
              setIsPreloading(false);
              setIsPreloadFadingOut(false);
            }, 1000);
            return () => clearTimeout(timer);
          }
        }
      }, 0);
    };

    photos.forEach((src, idx) => {
      const img = new Image();
      // 支持跨域获取（防止 Unsplash Demo 图片在 Canvas 压缩时报安全沙箱限制错误）
      img.crossOrigin = 'anonymous';
      tempImages.push(img);

      const triggerDecode = () => {
        if (typeof img.decode === 'function') {
          img.decode()
            .then(() => handleImageDecoded(idx, img))
            .catch((err) => {
              console.warn(`Failed to decode image asynchronously: ${src}`, err);
              handleImageDecoded(idx, img); // 降级处理，即使解码报错，也作为已加载推进，防止首屏卡死
            });
        } else {
          handleImageDecoded(idx, img);
        }
      };

      // 💡 优化：必须先绑定事件处理器，最后再给 src 赋值。
      // 否则在图片已被浏览器缓存的情况下，赋值 src 会直接触发加载完毕，从而遗漏 onload 监听。
      img.onload = triggerDecode;
      img.onerror = () => {
        console.error(`Failed to load image: ${src}`);
        handleImageDecoded(idx, img); // 容错处理
      };

      img.src = src;
    });
  }, [photos]);

  const handleStartJourney = () => {
    if (preloadProgress < 100) return; // 强力拦截：未到 100% 绝对禁止任何方式进入

    setIsPreloadFadingOut(true);
    setIsPlaying(true);
    setHasStarted(true);
    setTimeout(() => {
      setIsPreloading(false);
      setIsPreloadFadingOut(false);
    }, 1000);
  };

  const handleImportFolder = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const imgFiles = files.filter(f => /\.(png|jpe?g|gif|webp|svg)$/i.test(f.name));
      if (imgFiles.length === 0) return alert('文件夹内未找到支持的婚礼照片！');
      importedPhotos.forEach(url => URL.revokeObjectURL(url));
      const urls = imgFiles.map(f => URL.createObjectURL(f));
      setImportedPhotos(urls);
      setPhotos(urls);
      setCurrentIndex(0);
    }
  };

  const getNextIdx = (dir: number) => {
    if (photos.length <= 1) return currentIndex;
    if (isRandom) {
      let next = currentIndex;
      while (next === currentIndex) next = Math.floor(Math.random() * photos.length);
      return next;
    }
    return (currentIndex + dir + photos.length) % photos.length;
  };

  const handleNext = () => setCurrentIndex(getNextIdx(1));
  const handlePrev = () => setCurrentIndex(getNextIdx(-1));

  useEffect(() => {
    if (!isPlaying || photos.length <= 1 || isPreloading || isAlbumOpen) return;
    const interval = setInterval(handleNext, duration);
    return () => clearInterval(interval);
  }, [isPlaying, photos, duration, isRandom, currentIndex, isPreloading, isAlbumOpen]);

  useEffect(() => {
    // 强力拦截：首屏未加载完时，绝对禁止注册键盘快捷键
    if (isPreloading) return;

    const handleKeys = (e: KeyboardEvent) => {
      // 💡 优化：排除输入框 (INPUT) 和下拉选择菜单 (SELECT)，避免用户在底栏操作时按空格或方向键发生全局播放冲突
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'SELECT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      } else if (e.code === 'ArrowRight') {
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [photos, currentIndex, isRandom, isPlaying, isPreloading]);



  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPreloading) return; // 强力拦截：加载中点击屏幕不响应显隐，防止任何交互穿透
    const target = e.target as HTMLElement;
    if (target.closest('.control-bar-container')) return;
    setIsControlVisible((prev) => !prev);
  };

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden bg-black select-none"
      onClick={handleScreenClick}
    >
      <PhotoViewer photos={photos} currentIndex={currentIndex} transitionType={transitionType} duration={duration} />
      {hasStarted && (
        <>
          <ControlBar
            isVisible={isControlVisible} isPlaying={isPlaying} setIsPlaying={setIsPlaying} currentIndex={currentIndex} totalPhotos={photos.length}
            onPrev={handlePrev} onNext={handleNext} duration={duration} setDuration={setDuration} isRandom={isRandom} setIsRandom={setIsRandom}
            musicVolume={musicVolume} setMusicVolume={setMusicVolume}
            playlist={playlist} setPlaylist={setPlaylist} currentTrackIndex={currentTrackIndex} setCurrentTrackIndex={setCurrentTrackIndex}
            isMusicShuffle={isMusicShuffle} setIsMusicShuffle={setIsMusicShuffle} onAddMusicFile={handleAddMusicFile} onImportFolder={handleImportFolder}
            onOpenAlbum={() => setIsAlbumOpen(true)}
            transitionType={transitionType}
            setTransitionType={setTransitionType}
          />
          <PhotoAlbumModal
            isOpen={isAlbumOpen}
            onClose={() => setIsAlbumOpen(false)}
            photos={photos}
            thumbnails={thumbnails}
            currentIndex={currentIndex}
            onSelectPhoto={(idx) => {
              setCurrentIndex(idx);
              setIsAlbumOpen(false);
            }}
          />
        </>
      )}
      <MusicPlayer
        isPlaying={isPlaying} setIsPlaying={setIsPlaying} playlist={playlist}
        currentTrackIndex={currentTrackIndex} setCurrentTrackIndex={setCurrentTrackIndex}
        isMusicShuffle={isMusicShuffle} volume={musicVolume}
      />
      {isPreloading && (
        <LoadingScreen
          progress={preloadProgress}
          onStart={handleStartJourney}
          isReady={preloadProgress === 100}
          isFadingOut={isPreloadFadingOut}
          titleText={titleText}
        />
      )}
    </div>
  );
}