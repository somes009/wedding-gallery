import React, { useState, useEffect } from 'react';
import { PhotoViewer } from './components/PhotoViewer';
import { ControlBar } from './components/ControlBar';
import { MusicPlayer } from './components/MusicPlayer';

const DEMO = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=1500',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1500',
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1500',
];

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [duration, setDuration] = useState(8000);
  const [isRandom, setIsRandom] = useState(false);
  const [isPetalsOn, setIsPetalsOn] = useState(true);
  const [titleText, setTitleText] = useState('新郎 某某 ❤️ 新娘 某某 | 我们结婚啦 💍');

  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const [musicVolume, setMusicVolume] = useState(0.4);
  const [customMusicFile, setCustomMusicFile] = useState<File | null>(null);

  const [importedPhotos, setImportedPhotos] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);

  const [isControlVisible, setIsControlVisible] = useState(true);

  useEffect(() => {
    const modules = import.meta.glob('/src/assets/photos/*.{png,jpg,jpeg,PNG,JPG,JPEG,svg,webp}', { eager: true });
    const paths = Object.keys(modules).map((key) => (modules[key] as any).default || key);
    setPhotos(paths.length > 0 ? paths : DEMO);
  }, []);

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
    if (!isPlaying || photos.length <= 1) return;
    const interval = setInterval(handleNext, duration);
    return () => clearInterval(interval);
  }, [isPlaying, photos, duration, isRandom, currentIndex]);

  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
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
  }, [photos, currentIndex, isRandom, isPlaying]);

  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('.control-bar-container')) return;
    setIsControlVisible((prev) => !prev);
  };

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden bg-black select-none"
      onClick={handleScreenClick}
    >
      <PhotoViewer photos={photos} currentIndex={currentIndex} isPetalsOn={isPetalsOn} />
      <ControlBar
        isVisible={isControlVisible} isPlaying={isPlaying} setIsPlaying={setIsPlaying} currentIndex={currentIndex} totalPhotos={photos.length}
        onPrev={handlePrev} onNext={handleNext} duration={duration} setDuration={setDuration} isRandom={isRandom} setIsRandom={setIsRandom}
        isPetalsOn={isPetalsOn} setIsPetalsOn={setIsPetalsOn} titleText={titleText} setTitleText={setTitleText}
        isMusicPlaying={isMusicPlaying} setIsMusicPlaying={setIsMusicPlaying} musicVolume={musicVolume} setMusicVolume={setMusicVolume}
        customMusicFile={customMusicFile} setCustomMusicFile={setCustomMusicFile} onImportFolder={handleImportFolder}
      />
      <MusicPlayer isPlaying={isMusicPlaying} setIsPlaying={setIsMusicPlaying} customMusicFile={customMusicFile} volume={musicVolume} />
    </div>
  );
}