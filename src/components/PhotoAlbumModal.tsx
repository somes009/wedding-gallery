import React, { useEffect } from 'react';
import { X, Play } from 'lucide-react';

interface PhotoAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: string[];
  thumbnails: string[];
  currentIndex: number;
  onSelectPhoto: (index: number) => void;
}

export const PhotoAlbumModal: React.FC<PhotoAlbumModalProps> = ({
  isOpen,
  onClose,
  photos,
  thumbnails,
  currentIndex,
  onSelectPhoto,
}) => {
  // 监听 Esc 键关闭
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl transition-all duration-300 animate-[fadeIn_0.2s_ease-out] select-none"
      onClick={onClose}
    >
      <div
        className="relative w-[92vw] h-[85vh] max-w-7xl bg-neutral-900/60 rounded-3xl border border-white/10 flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()} // 阻止冒泡，点击内容区不关闭
      >
        {/* 背景金粉微粒装饰线 */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent" />

        {/* 头部标题区 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 shrink-0 bg-black/20">
          <div className="space-y-1">
            <h2 className="text-lg md:text-xl font-semibold tracking-wider text-rose-100 flex items-center gap-2">
              <span>💍 幸福瞬间影集</span>
              <span className="text-xs font-normal bg-rose-500/10 border border-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full">
                共 {photos.length} 张
              </span>
            </h2>
            <p className="text-xs text-rose-200/40 tracking-wider">
              点选任意一张照片即可精准跳转播放
            </p>
          </div>

          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all hover:rotate-90 duration-300"
            title="关闭影集"
          >
            <X size={20} />
          </button>
        </div>

        {/* 图片网格滚动区 */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {photos.map((src, index) => {
              const isActive = index === currentIndex;
              return (
                <div
                  key={index}
                  onClick={() => onSelectPhoto(index)}
                  className={`group relative aspect-[3/2] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 bg-neutral-950 border ${
                    isActive
                      ? 'ring-4 ring-rose-500 border-transparent shadow-[0_0_15px_rgba(244,63,94,0.4)] scale-102'
                      : 'border-white/5 hover:border-rose-400/30 hover:scale-102 hover:shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                  }`}
                >
                  {/* 图片本体 */}
                  <img
                    src={thumbnails[index] || src}
                    alt={`婚礼照片第 ${index + 1} 张`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />

                  {/* 悬浮全屏高光遮罩 */}
                  <div
                    className={`absolute inset-0 transition-opacity duration-300 ${
                      isActive
                        ? 'bg-rose-950/20'
                        : 'bg-black/30 group-hover:bg-rose-950/10'
                    }`}
                  />

                  {/* 正在播放中状态标识 */}
                  {isActive && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-rose-500 text-white text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full shadow-md animate-pulse">
                      <Play size={8} fill="currentColor" className="mt-[-0.5px]" />
                      <span>正在播放</span>
                    </div>
                  )}

                  {/* 右下角序号 */}
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 rounded text-[10px] text-white/70 font-mono tracking-wider">
                    {index + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};