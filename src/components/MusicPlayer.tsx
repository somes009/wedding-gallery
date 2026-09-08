import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Music, Shuffle, Repeat, ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react';

export interface Track {
  id: string;
  name: string;
  localSrc: string;
  isCustom?: boolean;
}

export const DEFAULT_PLAYLIST: Track[] = [
  { id: '1', name: '《萨蒂 · 吉诺佩蒂浪漫钢琴曲》', localSrc: '/gymnopedie.mp3' },
  { id: '2', name: '《巴赫 · 纯净宣誓 C大调前奏曲》', localSrc: '/bach_prelude.mp3' },
  { id: '3', name: '《埃尔加 · 爱之礼赞经典柔鸣》', localSrc: '/salut_damour.mp3' },
  { id: '4', name: '《贝多芬 · 经典月光奏鸣曲》', localSrc: '/moonlight_sonata.mp3' },
  { id: '5', name: '《萨蒂 · 吉诺佩蒂暖调协奏》', localSrc: '/gymnopedie_reconcert.mp3' }
];

interface MusicPlayerProps {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  playlist: Track[];
  currentTrackIndex: number;
  setCurrentTrackIndex: (idx: number) => void;
  isMusicShuffle: boolean;
  volume: number;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  isPlaying,
  playlist,
  currentTrackIndex,
  setCurrentTrackIndex,
  isMusicShuffle,
  volume,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<any>(null);
  const [musicSrc, setMusicSrc] = useState<string>('');
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const currentTrack = playlist[currentTrackIndex];

  useEffect(() => {
    if (currentTrack) {
      setMusicSrc(currentTrack.localSrc);
    } else {
      setMusicSrc('');
    }
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current && musicSrc) {
      audioRef.current.load();
      if (isPlaying) fadeIn();
    }
  }, [musicSrc]);

  const fadeIn = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    audio.play().then(() => setIsBlocked(false)).catch(() => setIsBlocked(true));
    let vol = 0;
    audio.volume = 0;
    fadeIntervalRef.current = setInterval(() => {
      vol += 0.05;
      if (vol >= volume) {
        audio.volume = volume;
        clearInterval(fadeIntervalRef.current);
      } else {
        audio.volume = vol;
      }
    }, 50);
  };

  const fadeOut = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    let vol = audio.volume;
    fadeIntervalRef.current = setInterval(() => {
      vol -= 0.05;
      if (vol <= 0) {
        audio.volume = 0;
        audio.pause();
        clearInterval(fadeIntervalRef.current);
      } else {
        audio.volume = vol;
      }
    }, 50);
  };

  useEffect(() => {
    if (isPlaying) fadeIn();
    else fadeOut();
    return () => { if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current); };
  }, [isPlaying]);

  useEffect(() => {
    const unlock = () => {
      if (isPlaying && audioRef.current?.paused) {
        fadeIn();
        window.removeEventListener('click', unlock);
        window.removeEventListener('keydown', unlock);
      }
    };
    if (isPlaying) {
      window.addEventListener('click', unlock);
      window.addEventListener('keydown', unlock);
    }
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.volume = volume;
    }
  }, [volume, isPlaying]);

  const handleAudioError = () => {
    console.error(`本地音频文件加载失败: ${musicSrc}`);
  };

  const handleTrackEnded = () => {
    if (playlist.length === 0) return;
    if (isMusicShuffle) {
      let nextIdx = currentTrackIndex;
      if (playlist.length > 1) {
        while (nextIdx === currentTrackIndex) {
          nextIdx = Math.floor(Math.random() * playlist.length);
        }
      }
      setCurrentTrackIndex(nextIdx);
    } else {
      setCurrentTrackIndex((currentTrackIndex + 1) % playlist.length);
    }
  };

  return (
    <>
      <div className="hidden">
        <audio ref={audioRef} src={musicSrc} onError={handleAudioError} onEnded={handleTrackEnded} preload="auto" />
      </div>
      {isBlocked && isPlaying && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none animate-pulse">
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-rose-500/25 border border-rose-500/40 text-rose-100 text-sm shadow-2xl backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="font-semibold tracking-wider drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">🎵 点击屏幕任意处，开启背景音乐...</span>
          </div>
        </div>
      )}
    </>
  );
};

interface MusicStatusBarProps {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  volume: number;
  setVolume: (v: number) => void;
  playlist: Track[];
  setPlaylist: React.Dispatch<React.SetStateAction<Track[]>>;
  currentTrackIndex: number;
  setCurrentTrackIndex: (idx: number) => void;
  isMusicShuffle: boolean;
  setIsMusicShuffle: (s: boolean) => void;
  onAddMusicFile: (file: File) => void;
}

export const MusicStatusBar: React.FC<MusicStatusBarProps> = ({
  isPlaying,
  setIsPlaying,
  volume,
  setVolume,
  playlist,
  setPlaylist,
  currentTrackIndex,
  setCurrentTrackIndex,
  isMusicShuffle,
  setIsMusicShuffle,
  onAddMusicFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);

  const currentTrack = playlist[currentTrackIndex];
  const musicName = currentTrack ? currentTrack.name : '无播放音乐';

  const moveTrack = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= playlist.length) return;

    const newPlaylist = [...playlist];
    const temp = newPlaylist[index];
    newPlaylist[index] = newPlaylist[targetIndex];
    newPlaylist[targetIndex] = temp;

    if (currentTrackIndex === index) {
      setCurrentTrackIndex(targetIndex);
    } else if (currentTrackIndex === targetIndex) {
      setCurrentTrackIndex(index);
    }
    setPlaylist(newPlaylist);
  };

  const deleteTrack = (index: number) => {
    if (playlist.length <= 1) {
      alert("婚礼现场至少需要保留一首背景音乐！");
      return;
    }
    const isPlayingDeleted = currentTrackIndex === index;
    const newPlaylist = playlist.filter((_, idx) => idx !== index);
    setPlaylist(newPlaylist);

    if (isPlayingDeleted) {
      const nextIdx = index >= newPlaylist.length ? 0 : index;
      setCurrentTrackIndex(nextIdx);
    } else if (currentTrackIndex > index) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  };

  return (
    <div className="relative flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs text-white">
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className={`p-1.5 rounded-full transition-all duration-300 ${isPlaying ? 'bg-rose-500 text-white animate-spin [animation-duration:8s]' : 'bg-white/20 text-gray-300 hover:text-white'}`}
      >
        <Music size={13} />
      </button>

      <button
        onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
        className="font-medium truncate max-w-[100px] text-left hover:text-rose-400 transition-colors flex items-center gap-1 shrink-0"
        title="点击展开婚礼歌单"
      >
        <span className="truncate">{musicName}</span>
        <span className="text-[9px] text-gray-400 shrink-0 select-none">▼</span>
      </button>

      <div className="flex items-center gap-1 border-l border-white/20 pl-2">
        <button onClick={() => setVolume(volume === 0 ? 0.5 : 0)}>
          {volume === 0 ? <VolumeX size={13} /> : <Volume2 size={13} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-10 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-rose-500"
        />
      </div>

      <button
        onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
        className={`text-[10px] px-2 py-0.5 rounded transition-all ${isPlaylistOpen ? 'bg-rose-500 text-white' : 'bg-white/20 hover:bg-rose-500'}`}
      >
        歌单
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onAddMusicFile(file);
        }}
        className="hidden"
      />

      {isPlaylistOpen && (
        <div className="absolute bottom-14 right-[-40px] sm:left-1/2 sm:-translate-x-1/2 mb-1 w-[320px] sm:w-[380px] z-50 bg-black/95 backdrop-blur-2xl rounded-2xl border border-white/15 p-4 shadow-2xl flex flex-col gap-3 text-white pointer-events-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-1.5 font-medium text-xs text-rose-400">
              <Music size={13} className="animate-pulse" />
              <span>婚礼专属背景音乐库 ({playlist.length})</span>
            </div>
            <button onClick={() => setIsPlaylistOpen(false)} className="text-gray-400 hover:text-white text-[10px] px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10">关闭</button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-300">
            <span>播放模式:</span>
            <button onClick={() => setIsMusicShuffle(!isMusicShuffle)} className={`flex items-center gap-1 px-2 py-1 rounded transition-all ${isMusicShuffle ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-white/5'}`}>
              {isMusicShuffle ? <><Shuffle size={10} /> 随机播放中</> : <><Repeat size={10} /> 列表顺序播放</>}
            </button>
          </div>
          <div className="max-h-[180px] overflow-y-auto flex flex-col gap-1 pr-1 scrollbar-thin">
            {playlist.map((track, idx) => {
              const isCurrent = currentTrackIndex === idx;
              return (
                <div key={track.id} className={`group flex items-center justify-between px-2 py-1.5 rounded-lg ${isCurrent ? 'bg-rose-500/10 border border-rose-500/20' : 'bg-white/5 hover:bg-white/10 border border-transparent'}`}>
                  <div onClick={() => { setCurrentTrackIndex(idx); setIsPlaying(true); }} className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                    {isCurrent && isPlaying ? (
                      <span className="flex gap-0.5 items-end h-3 w-3 shrink-0 pb-0.5">
                        <span className="w-0.5 bg-rose-500 animate-[bounce_0.8s_infinite_100ms] h-[60%]"></span>
                        <span className="w-0.5 bg-rose-500 animate-[bounce_0.8s_infinite_300ms] h-[100%]"></span>
                        <span className="w-0.5 bg-rose-500 animate-[bounce_0.8s_infinite_200ms] h-[40%]"></span>
                      </span>
                    ) : <span className="text-[10px] text-gray-400 w-3 shrink-0 text-center font-mono">{idx + 1}</span>}
                    <span className={`text-xs truncate ${isCurrent ? 'text-rose-400 font-medium' : 'text-gray-200'}`}>{track.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); moveTrack(idx, 'up'); }} disabled={idx === 0} className="p-1 rounded hover:bg-white/10 disabled:opacity-20 transition-all"><ChevronUp size={12} /></button>
                    <button onClick={(e) => { e.stopPropagation(); moveTrack(idx, 'down'); }} disabled={idx === playlist.length - 1} className="p-1 rounded hover:bg-white/10 disabled:opacity-20 transition-all"><ChevronDown size={12} /></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteTrack(idx); }} disabled={playlist.length <= 1} className="p-1 rounded hover:bg-rose-500/20 disabled:opacity-20 transition-all"><Trash2 size={12} /></button>
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="w-full py-1.5 rounded-lg border border-dashed border-white/20 hover:border-rose-500/40 hover:bg-rose-500/5 text-gray-300 hover:text-rose-400 text-xs flex items-center justify-center gap-1.5 transition-all mt-1 font-light">
            <Plus size={12} /><span>添加更多本地婚礼音乐 (MP3/WAV)</span>
          </button>
        </div>
      )}
    </div>
  );
};