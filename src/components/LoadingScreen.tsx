import React from 'react';

interface LoadingScreenProps {
  progress: number;
  onStart: () => void;
  isReady: boolean;
  isFadingOut: boolean;
  titleText: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  progress,
  onStart,
  isReady,
  isFadingOut,
  titleText,
}) => {
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-all duration-1000 select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100'
      }`}
      style={{
        background: 'radial-gradient(circle, rgba(32,15,22,1) 0%, rgba(5,5,5,1) 100%)',
      }}
    >
      <div className="flex flex-col items-center space-y-8 max-w-lg px-6 text-center">
        {/* 浪漫双心动效 */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* 光晕背景 */}
          <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-2xl animate-pulse" />
          
          {/* 红色双心 SVG */}
          <svg
            className="w-20 h-20 text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.6)]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            {/* 左边小爱心 */}
            <path
              className="animate-[pulse_1.5s_infinite_ease-in-out_alternate]"
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
          <svg
            className="absolute -right-2 -bottom-1 w-10 h-10 text-rose-400 drop-shadow-[0_0_10px_rgba(251,113,133,0.6)] animate-[bounce_2s_infinite_ease-in-out]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            {/* 右边大爱心 */}
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>

        {/* 浪漫文字 */}
        <div className="space-y-3">
          <h1 className="text-xl md:text-2xl font-semibold tracking-wider text-rose-100/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] px-4">
            {titleText.split('|')[0] || '我们的婚礼相册'}
          </h1>
          <p className="text-xs md:text-sm text-rose-200/50 tracking-widest uppercase">
            Our Romantic Wedding Memory
          </p>
        </div>

        {/* 按钮或进度条切换区域 */}
        <div className="w-64 h-20 flex flex-col items-center justify-center">
          {!isReady ? (
            <div className="w-full flex flex-col items-center space-y-3">
              {/* 进度条轨道 */}
              <div className="w-full h-1.5 bg-rose-950/40 rounded-full border border-rose-900/20 overflow-hidden shadow-inner">
                {/* 进度金粉流光 */}
                <div
                  className="h-full bg-gradient-to-r from-rose-500 via-pink-400 to-rose-400 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.5)] transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs tracking-wider text-rose-200/70 animate-pulse">
                正在筹备美好瞬间... {progress}%
              </div>
            </div>
          ) : (
            /* 点击开启浪漫之旅按钮 */
            <button
              onClick={onStart}
              className="group relative px-8 py-3.5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 text-white font-medium rounded-full shadow-[0_0_25px_rgba(244,63,94,0.4)] transition-all duration-500 ease-out hover:scale-105 hover:shadow-[0_0_35px_rgba(244,63,94,0.7)] active:scale-95 cursor-pointer"
            >
              {/* 呼吸外环 */}
              <span className="absolute -inset-1 rounded-full bg-rose-400/30 blur opacity-75 group-hover:opacity-100 group-hover:duration-200 animate-ping pointer-events-none" />
              <span className="relative flex items-center justify-center space-x-2 text-sm md:text-base tracking-widest font-semibold">
                <span>开启幸福之旅</span>
                <span className="animate-bounce">💍</span>
              </span>
            </button>
          )}
        </div>

        {/* 底部优雅页脚 */}
        <div className="text-[11px] text-rose-300/25 tracking-widest pt-12">
          DESIGNED FOR A LIFETIME OF LOVE
        </div>
      </div>
    </div>
  );
};