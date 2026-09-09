import React, { useEffect, useState } from 'react';

interface PhotoLayer {
  key: number;
  src: string;
  index: number;
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
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat'
          }}
        >
          {/* 选项 1：双层梦幻虚化背景 */}
          <div className="relative w-full h-full flex items-center justify-center">
            {/* 底层高斯模糊容器，统一控制最终不透明度：新背景慢速淡入（1.5s），老背景慢速淡出（1.5s） */}
            <div 
              className={`absolute inset-0 w-full h-full opacity-45 pointer-events-none select-none ${
                layer.isNew ? 'animate-fade-in-slow' : 'animate-fade-out-slow'
              }`}
            >
              <img
                src={layer.src}
                alt=""
                className={`absolute inset-0 w-[115%] h-[110%] -left-[7.5%] -top-[5%] object-cover blur-[40px] ${getKenBurnsClass(layer.index)}`}
              />
            </div>

            {/* 前景高清图容器：新图优雅变焦淡入（1.2s），老图极速消融淡出（0.4s） */}
            <div 
              className={`absolute inset-0 flex items-center justify-center p-6 md:p-12 z-10 ${
                layer.isNew ? 'animate-cinematic-zoom-in' : 'animate-foreground-fade-out'
              }`}
            >
              <img
                src={layer.src}
                alt=""
                className={`max-w-full max-h-full object-contain rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.65)] ${getKenBurnsClass(layer.index)}`}
              />
            </div>
          </div>
        </div>
      ))}

    </div>
  );
};