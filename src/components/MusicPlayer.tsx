import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';

interface MusicPlayerProps {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  customMusicFile: File | null;
  volume: number;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  isPlaying,
  setIsPlaying,
  customMusicFile,
  volume,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<any>(null);
  const [musicSrc, setMusicSrc] = useState<string>('/music.mp3');

  useEffect(() => {
    if (customMusicFile) {
      const url = URL.createObjectURL(customMusicFile);
      setMusicSrc(url);
      setIsPlaying(true);
      return () => URL.revokeObjectURL(url);
    }
  }, [customMusicFile, setIsPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      if (isPlaying) fadeIn();
    }
  }, [musicSrc]);

  const fadeIn = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    audio.play().catch(err => console.log("Play failed:", err));

    let currentVol = 0;
    audio.volume = 0;
    fadeIntervalRef.current = setInterval(() => {
      currentVol += 0.05;
      if (currentVol >= volume) {
        audio.volume = volume;
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      } else {
        audio.volume = currentVol;
      }
    }, 50);
  };

  const fadeOut = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    let currentVol = audio.volume;
    fadeIntervalRef.current = setInterval(() => {
      currentVol -= 0.05;
      if (currentVol <= 0) {
        audio.volume = 0;
        audio.pause();
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      } else {
        audio.volume = currentVol;
      }
    }, 50);
  };

  useEffect(() => {
    if (isPlaying) fadeIn();
    else fadeOut();
    return () => {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };
  }, [isPlaying]);

  // 首击/点按解冻浏览器自动播放政策限制（Autoplay Policy Unlocker）
  useEffect(() => {
    const unlock = () => {
      if (isPlaying && audioRef.current && audioRef.current.paused) {
        fadeIn(); // 温柔淡入响起
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
    if (musicSrc === '/music.mp3') {
      setMusicSrc('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3');
    }
  };

  return (
    <div className="hidden">
      <audio ref={audioRef} src={musicSrc} loop onError={handleAudioError} preload="auto" />
    </div>
  );
};

interface MusicStatusBarProps {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  volume: number;
  setVolume: (v: number) => void;
  customMusicFile: File | null;
  setCustomMusicFile: (f: File | null) => void;
}

export const MusicStatusBar: React.FC<MusicStatusBarProps> = ({
  isPlaying,
  setIsPlaying,
  volume,
  setVolume,
  customMusicFile,
  setCustomMusicFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [musicName, setMusicName] = useState<string>('婚礼背景音乐');

  useEffect(() => {
    if (customMusicFile) {
      setMusicName(customMusicFile.name.replace(/\.[^/.]+$/, ""));
    } else {
      setMusicName('婚礼背景音乐 (默认)');
    }
  }, [customMusicFile]);

  return (
    <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs text-white">
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className={`p-1.5 rounded-full transition-all duration-300 ${
          isPlaying ? 'bg-rose-500 text-white animate-spin [animation-duration:8s]' : 'bg-white/20 text-gray-300 hover:text-white'
        }`}
      >
        <Music size={13} />
      </button>

      <span className="font-medium truncate max-w-[100px]" title={musicName}>
        {musicName}
      </span>

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
        onClick={() => fileInputRef.current?.click()}
        className="text-[10px] bg-white/20 hover:bg-rose-500 px-2 py-0.5 rounded transition-all"
      >
        切歌
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={(e) => e.target.files?.[0] && setCustomMusicFile(e.target.files[0])}
        className="hidden"
      />
    </div>
  );
};