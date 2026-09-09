import React, { useState, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Maximize, Minimize, Type, FolderOpen, LayoutGrid } from 'lucide-react';
import { MusicStatusBar, Track } from './MusicPlayer';
import { TransitionType } from './PhotoViewer';

interface Props {
  isVisible: boolean; isPlaying: boolean; setIsPlaying: (p: boolean) => void;
  currentIndex: number; totalPhotos: number; onPrev: () => void; onNext: () => void;
  duration: number; setDuration: (ms: number) => void; isRandom: boolean; setIsRandom: (r: boolean) => void;
  titleText: string; setTitleText: (t: string) => void;
  isMusicPlaying: boolean; setIsMusicPlaying: (p: boolean) => void; musicVolume: number; setMusicVolume: (v: number) => void;
  playlist: Track[]; setPlaylist: React.Dispatch<React.SetStateAction<Track[]>>;
  currentTrackIndex: number; setCurrentTrackIndex: (idx: number) => void;
  isMusicShuffle: boolean; setIsMusicShuffle: (s: boolean) => void;
  onAddMusicFile: (file: File) => void;
  onImportFolder: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenAlbum: () => void;
  transitionType: TransitionType;
  setTransitionType: (t: TransitionType) => void;
}

export const ControlBar: React.FC<Props> = ({
  isVisible, isPlaying, setIsPlaying, currentIndex, totalPhotos, onPrev, onNext,
  duration, setDuration, isRandom, setIsRandom,
  titleText, setTitleText, isMusicPlaying, setIsMusicPlaying, musicVolume,
  setMusicVolume, playlist, setPlaylist, currentTrackIndex, setCurrentTrackIndex,
  isMusicShuffle, setIsMusicShuffle, onAddMusicFile, onImportFolder,
  onOpenAlbum, transitionType, setTransitionType
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const toggleFull = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(e => console.log(e));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const btn = "p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all";

  return (
    <div className={`control-bar-container fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col gap-2 items-center transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'}`}>
      <div className="flex items-center gap-3 bg-black/60 backdrop-blur-lg px-4 py-2 rounded-2xl border border-white/10 shadow-2xl">
        <button onClick={() => fileRef.current?.click()} className={btn} title="文件夹追加照片">
          <FolderOpen size={16} />
        </button>
        <input ref={fileRef} type="file" {...{webkitdirectory: "", directory: "", multiple: true} as any} onChange={onImportFolder} className="hidden" />

        <div className="flex items-center gap-1 border-l border-white/10 pl-2">
          <button onClick={onPrev} className={btn} disabled={totalPhotos <= 1}><SkipBack size={16} /></button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white transition-all hover:scale-105">
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button onClick={onNext} className={btn} disabled={totalPhotos <= 1}><SkipForward size={16} /></button>
        </div>

        <div className="flex items-center gap-1.5 border-l border-white/10 pl-2 text-xs">
          <button onClick={() => setIsRandom(!isRandom)} className={`p-1.5 rounded-lg transition-all ${isRandom ? 'text-rose-400 bg-rose-500/10' : 'text-gray-300'}`}>
            {isRandom ? <Shuffle size={14} /> : <Repeat size={14} />}
          </button>
          <select
            value={[3000, 5000, 8000, 10000].includes(duration) ? duration : "custom"}
            onChange={e => {
              const val = e.target.value;
              if (val === "custom") {
                setDuration(12000); // 默认自定义设为 12 秒
              } else {
                setDuration(Number(val));
              }
            }}
            className="bg-white/10 text-white rounded-lg px-2 py-1 text-xs border border-white/10 cursor-pointer focus:outline-none"
          >
            <option value={3000} className="bg-neutral-950">3秒/张</option>
            <option value={5000} className="bg-neutral-900">5秒/张</option>
            <option value={8000} className="bg-neutral-900">8秒/张</option>
            <option value={10000} className="bg-neutral-900">10秒/张</option>
            <option value="custom" className="bg-neutral-950">自定义...</option>
          </select>

          {![3000, 5000, 8000, 10000].includes(duration) && (
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 animate-pulse">
              <input
                type="number"
                min="1"
                max="300"
                value={Math.round(duration / 1000)}
                onChange={e => {
                  const s = Math.max(1, Math.min(300, Number(e.target.value)));
                  setDuration(s * 1000);
                }}
                className="w-8 bg-transparent text-white text-xs text-center focus:outline-none font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-[10px] text-gray-400 select-none">秒</span>
            </div>
          )}

          <select
            value={transitionType}
            onChange={e => setTransitionType(e.target.value as TransitionType)}
            className="bg-white/10 text-white rounded-lg px-2 py-1 text-xs border border-white/10 cursor-pointer focus:outline-none"
            title="过渡动效"
          >
            <option value="slide" className="bg-neutral-950">横向滑动</option>
            <option value="slideV" className="bg-neutral-900">纵向滑动</option>
            <option value="fade" className="bg-neutral-900">经典淡入</option>
            <option value="zoom" className="bg-neutral-900">电影缩放</option>
            <option value="none" className="bg-neutral-950">无转场</option>
          </select>
        </div>

        <div className="flex items-center gap-1 border-l border-white/10 pl-2">
          <button onClick={() => setIsEditing(!isEditing)} className={`p-1.5 rounded-lg transition-all ${isEditing ? 'text-rose-400 bg-rose-500/10' : 'text-gray-300'}`} title="编辑相册字幕">
            <Type size={14} />
          </button>
          <button onClick={onOpenAlbum} className={btn} title="查看幸福影集">
            <LayoutGrid size={14} />
          </button>
          <button onClick={toggleFull} className={btn} title={isFullscreen ? "退出全屏" : "全屏播放"}>
            {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
          </button>
        </div>

        <div className="border-l border-white/10 pl-2">
          <MusicStatusBar
            isPlaying={isMusicPlaying}
            setIsPlaying={setIsMusicPlaying}
            volume={musicVolume}
            setVolume={setMusicVolume}
            playlist={playlist}
            setPlaylist={setPlaylist}
            currentTrackIndex={currentTrackIndex}
            setCurrentTrackIndex={setCurrentTrackIndex}
            isMusicShuffle={isMusicShuffle}
            setIsMusicShuffle={setIsMusicShuffle}
            onAddMusicFile={onAddMusicFile}
          />
        </div>
      </div>

      {isEditing && (
        <div className="flex items-center gap-2 bg-black/80 backdrop-blur-lg px-3 py-1.5 rounded-xl border border-white/10 w-[300px] sm:w-[380px]">
          <span className="text-xs text-rose-400 font-semibold shrink-0">字幕:</span>
          <input type="text" value={titleText} onChange={e => setTitleText(e.target.value)} placeholder="李雷 ❤️ 韩梅梅 | 2026.09.08" className="bg-white/5 border border-white/10 rounded px-2 py-0.5 text-xs text-white w-full focus:outline-none" />
          <button onClick={() => setIsEditing(false)} className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded shrink-0">保存</button>
        </div>
      )}

      {totalPhotos > 0 && <div className="text-[10px] bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full text-white/60">{currentIndex + 1} / {totalPhotos}</div>}
    </div>
  );
};