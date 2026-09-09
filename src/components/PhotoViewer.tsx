import React, { useEffect, useState } from 'react';

interface PhotoLayer {
  key: number;
  src: string;
  isNew: boolean;
}

interface ViewerProps {
  photos: string[];
  currentIndex: number;
}

export const PhotoViewer: React.FC<ViewerProps> = ({
  photos,
  currentIndex,
}) => {
  const [activeLayers, setActiveLayers] = useState<PhotoLayer[]>([]);

  useEffect(() => {
    const photo = photos[currentIndex];
    if (!photo) return;

    const newKey = Date.now();

    setActiveLayers((prev) => {
      if (prev.length === 0) {
        return [{ key: newKey, src: photo, isNew: true }];
      }
      const lastActive = prev[prev.length - 1];
      return [
        { ...lastActive, isNew: false },
        { key: newKey, src: photo, isNew: true }
      ];
    });

    // 1000ms 后从 DOM 中彻底清理老图层，确保 1000ms 的淡出动画完美、平滑地播放完毕
    const cleanupTimer = setTimeout(() => {
      setActiveLayers((prev) => prev.filter(l => l.key === newKey));
    }, 1000);

    return () => clearTimeout(cleanupTimer);
  }, [currentIndex, photos]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none flex items-center justify-center">
      {activeLayers.map((layer) => (
        <div
          key={layer.key}
          className={`absolute inset-0 flex items-center justify-center p-6 md:p-12 z-10 transition-opacity duration-1000 ease-in-out ${
            layer.isNew ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <img
            src={layer.src}
            alt=""
            className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
          />
        </div>
      ))}
    </div>
  );
};