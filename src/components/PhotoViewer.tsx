import React, { useEffect, useState } from 'react';
import { PetalsEffect } from './PetalsEffect';

interface PhotoLayer {
  key: number;
  src: string;
  index: number;
  isNew: boolean;
}

interface ViewerProps {
  photos: string[];
  currentIndex: number;
  isPetalsOn: boolean;
}

export const PhotoViewer: React.FC<ViewerProps> = ({
  photos,
  currentIndex,
  isPetalsOn,
}) => {
  const [activeLayers, setActiveLayers] = useState<PhotoLayer[]>([]);

  useEffect(() => {
    const photo = photos[currentIndex];
    if (!photo) return;

    const newKey = Date.now();

    setActiveLayers((prev) => {
      if (prev.length === 0) {
        return [{ key: newKey, src: photo, index: currentIndex, isNew: true }];
      }
      const lastActive = prev[prev.length - 1];
      return [
        { ...lastActive, isNew: false },
        { key: newKey, src: photo, index: currentIndex, isNew: true }
      ];
    });

    const cleanupTimer = setTimeout(() => {
      setActiveLayers((prev) => prev.filter(l => l.key === newKey));
    }, 1600);

    return () => clearTimeout(cleanupTimer);
  }, [currentIndex, photos]);

  const getKenBurnsClass = (index: number) => {
    const anims = [
      'animate-kenburns-slow-zoom-in',
      'animate-kenburns-slow-zoom-out',
      'animate-kenburns-slow-pan-left',
      'animate-kenburns-slow-pan-right'
    ];
    return anims[Math.abs(index) % anims.length];
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      {/* 照片全屏渲染多图层 */}
      {activeLayers.map((layer) => (
        <div
          key={layer.key}
          className={`absolute inset-0 w-full h-full overflow-hidden ${
            layer.isNew ? 'animate-fade-in-slow' : 'opacity-100'
          }`}
        >
          {/* 电影感缓动的前景全屏高清图层 */}
          <img
            src={layer.src}
            alt=""
            className={`w-full h-full object-cover ${getKenBurnsClass(layer.index)}`}
          />
        </div>
      ))}

      {/* 玫瑰花瓣雨特效层 */}
      {isPetalsOn && <PetalsEffect />}
    </div>
  );
};