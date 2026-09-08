import React, { useRef } from 'react';
import { Heart, FolderHeart, Sparkles } from 'lucide-react';

interface WelcomeProps {
  onStart: () => void;
  localPhotosCount: number;
  importedPhotosCount: number;
  titleText: string;
  setTitleText: (t: string) => void;
  onImportFolder: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const WelcomeScreen: React.FC<WelcomeProps> = ({
  onStart,
  localPhotosCount,
  importedPhotosCount,
  titleText,
  setTitleText,
  onImportFolder,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const totalCount = localPhotosCount + importedPhotosCount;

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-gradient-to-tr from-stone-950 via-rose-950 to-neutral-950 overflow-hidden text-white px-4">
      {/* 背景奢华微弱粒子 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.1)_0%,transparent_70%)]" />

      {/* 唯美的卡片 */}
      <div className="relative z-10 max-w-xl w-full text-center bg-black/40 backdrop-blur-xl p-8 sm:p-12 rounded-3xl border border-rose-500/15 shadow-[0_0_50px_rgba(244,63,94,0.1)] flex flex-col items-center">
        {/* 心形呼吸灯 */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-xl animate-pulse scale-125" />
          <div className="relative w-16 h-16 bg-rose-500/10 rounded-full border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Heart size={32} className="fill-rose-500/40 animate-bounce [animation-duration:2.5s]" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3.5xl font-extralight tracking-[0.2em] mb-3 text-rose-100 drop-shadow-md">
          我们的婚礼大屏
        </h1>
        <p className="text-xs sm:text-sm text-rose-300/60 font-light tracking-widest mb-8">
          OUR WEDDING SLIDESHOW
        </p>

        {/* 核心功能区 */}
        <div className="w-full space-y-6 mb-8 text-sm">
          {/* 字幕定制 */}
          <div className="flex flex-col gap-2 text-left bg-white/5 p-4 rounded-xl border border-white/5">
            <label className="text-xs text-rose-300 font-semibold tracking-wider flex items-center gap-1.5">
              <Sparkles size={12} />
              自定婚礼寄语 / 底部字幕
            </label>
            <input
              type="text"
              value={titleText}
              onChange={(e) => setTitleText(e.target.value)}
              placeholder="新郎 姓名 ❤️ 新娘 姓名 | 2026.09.08"
              className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-rose-100 focus:outline-none focus:border-rose-500/50 w-full transition-all"
            />
          </div>

          {/* 状态检测 */}
          {totalCount > 0 ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 p-4 rounded-xl text-xs space-y-1">
              <p className="font-semibold">✨ 照片已就绪！</p>
              <p className="text-emerald-300/70">
                已加载 {localPhotosCount > 0 ? `内置照片 ${localPhotosCount} 张` : ''} 
                {importedPhotosCount > 0 ? ` 文件夹导入 ${importedPhotosCount} 张` : ''}。
              </p>
            </div>
          ) : (
            <div className="bg-amber-500/5 border border-amber-500/10 text-amber-200 p-4 rounded-xl text-xs space-y-2.5">
              <p className="font-semibold">📁 暂无照片，请进行以下操作之一：</p>
              <p className="text-amber-300/60 text-left leading-relaxed">
                1. 把照片扔进项目的 <code className="bg-black/50 px-1 py-0.5 rounded text-rose-300 font-mono">src/assets/photos/</code> 目录下。<br />
                2. 或点击下方一键选中您电脑里的婚礼照片文件夹，开机即播。
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-200 hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2"
              >
                <FolderHeart size={14} />
                选择本地照片文件夹
              </button>
              <input
                ref={fileInputRef}
                type="file"
                // @ts-ignore
                webkitdirectory=""
                directory=""
                multiple
                onChange={onImportFolder}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* 浪漫开启按钮 */}
        <button
          onClick={onStart}
          className="relative group w-full sm:w-64 py-4 rounded-full font-light tracking-[0.25em] text-white bg-gradient-to-r from-rose-500 to-amber-500 shadow-lg shadow-rose-500/20 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 overflow-hidden"
        >
          <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          开启大屏之旅
        </button>

        <p className="mt-6 text-[10px] text-stone-500 font-light">
          提示：进入大屏后，鼠标静止 3 秒控制面板将自动隐形。支持键盘空格键暂停，左右方向键切歌。
        </p>
      </div>
    </div>
  );
};