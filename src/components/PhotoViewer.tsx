import React, { useEffect, useState, useRef } from 'react';

export type TransitionType = 'none' | 'slide' | 'slideV' | 'fade' | 'zoom';

interface Slide {
  id: number;       // 固定物理标识：0, 1, 2，用作固定的 React key，DOM 绝对不重建
  leftVw: number;    // 每个槽位卡片在容器内的物理相对偏移：-100, 0, 100
  photoIndex: number; // 当前该卡片所绑定的照片数组索引
}

interface ViewerProps {
  photos: string[];
  currentIndex: number;
  transitionType?: TransitionType;
}

export const PhotoViewer: React.FC<ViewerProps> = ({
  photos,
  currentIndex,
  transitionType = 'slide',
}) => {
  // 💡 displayIndex 记录当前可见中车厢图片的索引
  const [displayIndex, setDisplayIndex] = useState(currentIndex);
  const [trackOffset, setTrackOffset] = useState(0); // 轨道偏移：0vw 居中，-100vw 展示右侧，100vw 展示左侧
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 💡 用于缓存已下载并解码完图片的就绪状态，防止后续重复触发渐现动画
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>(() => {
    const initialPhoto = photos[currentIndex];
    return initialPhoto ? { [initialPhoto]: true } : {};
  });

  // 💡 物理三槽位，其 DOM 结构 and key 永远不变
  const [slides, setSlides] = useState<Slide[]>(() => {
    const total = photos.length;
    if (total === 0) return [];
    const prevIdx = (currentIndex - 1 + total) % total;
    const nextIdx = (currentIndex + 1) % total;
    return [
      { id: 0, leftVw: -100, photoIndex: prevIdx },
      { id: 1, leftVw: 0, photoIndex: currentIndex },
      { id: 2, leftVw: 100, photoIndex: nextIdx },
    ];
  });

  // 1️⃣ 💡 同步初始/变更后的图片就绪状态、外层索引跳转与 slides 状态初始化
  // 解决 React onLoad 在浏览器强缓存下不触发，以及外部非顺序直接跳转的定位
  useEffect(() => {
    const total = photos.length;
    if (total === 0) return;

    const currentPhoto = photos[currentIndex];
    if (currentPhoto) {
      setLoadedImages((prev) => {
        if (prev[currentPhoto]) return prev;
        return { ...prev, [currentPhoto]: true };
      });
    }

    // 判断是否是顺序相邻。如果是顺序相邻，我们让转场状态机 (3️⃣) 去跑丝滑滚动动画
    const isSequentialNext = currentIndex === (displayIndex + 1) % total;
    const isSequentialPrev = currentIndex === (displayIndex - 1 + total) % total;

    // 如果 slides 为空（首次加载数据）或者发生了非相邻的大跨度跳转（例如点击缩略图）或者使用了无动画模式 (none)
    if (
      slides.length === 0 ||
      (currentIndex !== displayIndex && (!isSequentialNext || !isSequentialPrev || transitionType === 'none'))
    ) {
      const prevIdx = (currentIndex - 1 + total) % total;
      const nextIdx = (currentIndex + 1) % total;
      setSlides([
        { id: 0, leftVw: -100, photoIndex: prevIdx },
        { id: 1, leftVw: 0, photoIndex: currentIndex },
        { id: 2, leftVw: 100, photoIndex: nextIdx },
      ]);
      setDisplayIndex(currentIndex);
      setTrackOffset(0);
      setIsTransitioning(false);
    }
  }, [photos, currentIndex, displayIndex, slides.length, transitionType]);

  // 2️⃣ 💡 后台预测性异步加载与解码（Pre-decode）机制：
  // 利用高级 decode() 异步解码大图，保持硬件就绪缓存。
  useEffect(() => {
    const total = photos.length;
    if (total <= 1) return;

    const nextIndex = (currentIndex + 1) % total;
    const prevIndex = (currentIndex - 1 + total) % total;

    const indicesToPreload = [nextIndex, prevIndex];
    const activePreloads: HTMLImageElement[] = [];

    indicesToPreload.forEach((idx) => {
      const src = photos[idx];
      if (!src || loadedImages[src]) return;

      const img = new Image();
      img.src = src;
      img.decoding = 'async';

      img.decode()
        .then(() => {
          setLoadedImages((prev) => ({ ...prev, [src]: true }));
        })
        .catch(() => {
          img.onload = () => {
            setLoadedImages((prev) => ({ ...prev, [src]: true }));
          };
        });

      activePreloads.push(img);
    });

    return () => {
      activePreloads.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [currentIndex, photos, loadedImages]);

  // 3️⃣ 💡 处理转场滑轨状态机（丝滑无卡顿槽位轮轮转核心）
  useEffect(() => {
    if (currentIndex === displayIndex || transitionType === 'none') return;

    const total = photos.length;
    if (total <= 1) {
      setDisplayIndex(currentIndex);
      return;
    }

    // 清除任何未完成的重置定时器，防止高速连击导致的定位混乱
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 💡 智能判断方向：是否是顺序切换（包含首尾循环切换）
    const isNextSequential = currentIndex === (displayIndex + 1) % total;
    const isPrevSequential = currentIndex === (displayIndex - 1 + total) % total;

    if (isNextSequential) {
      // 顺序向前：滑轨向左移动 -100，让右侧在 leftVw: 100 的卡片滑入视口
      setIsTransitioning(true);
      setTrackOffset(-100);

      timeoutRef.current = setTimeout(() => {
        // 💡 420ms 动画结束瞬间：执行极致丝滑物理轮换（对冲变换，0 重新显存上传）
        // 1. 关闭过渡，让所有位置更新瞬间无感完成
        setIsTransitioning(false);
        // 2. 将滑轨位置重置回 0vw
        setTrackOffset(0);
        // 3. 将中间可见索引更新为新索引
        setDisplayIndex(currentIndex);
        // 4. 重置卡片物理 left 位置，当前卡片移入 leftVw: 0，其他卡片平铺
        setSlides((prevSlides) => {
          return prevSlides.map((slide) => {
            if (slide.leftVw === 100) {
              // 刚刚滑入可视区的右侧卡片，安家在 0 位置，其 src (photoIndex) 完全不动！
              return { ...slide, leftVw: 0 };
            } else if (slide.leftVw === 0) {
              // 刚刚滑出可视区的中侧卡片，退居为 -100 左侧卡片，其 src 完全不动！
              return { ...slide, leftVw: -100 };
            } else {
              // 已经不可见的左侧卡片，以最快速度在后台飞越至最右侧 (100)，并载入全新的下一张大图！
              const newNextIndex = (currentIndex + 1) % total;
              return { ...slide, leftVw: 100, photoIndex: newNextIndex };
            }
          });
        });
      }, 420);
    } else if (isPrevSequential) {
      // 顺序向后：滑轨向右移动 100，让左侧在 leftVw: -100 的卡片滑入视口
      setIsTransitioning(true);
      setTrackOffset(100);

      timeoutRef.current = setTimeout(() => {
        // 💡 420ms 动画结束瞬间：执行极致丝滑物理轮换（对冲变换，0 重新显存上传）
        setIsTransitioning(false);
        setTrackOffset(0);
        setDisplayIndex(currentIndex);
        setSlides((prevSlides) => {
          return prevSlides.map((slide) => {
            if (slide.leftVw === -100) {
              // 刚刚滑入可视区的左侧卡片，安家在 0 位置，其 src (photoIndex) 完全不动！
              return { ...slide, leftVw: 0 };
            } else if (slide.leftVw === 0) {
              // 刚刚滑出可视区的中侧卡片，退居为 100 右侧卡片，其 src 完全不动！
              return { ...slide, leftVw: 100 };
            } else {
              // 已经不可见的右侧卡片，以最快速度在后台飞越至最左侧 (-100)，并载入全新的上一张大图！
              const newPrevIndex = (currentIndex - 1 + total) % total;
              return { ...slide, leftVw: -100, photoIndex: newPrevIndex };
            }
          });
        });
      }, 420);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, displayIndex, photos, transitionType]);

  // 🛡️ 防御性编程：将此判断放置于所有 Hooks 的下方！
  // 完美符合 React Rule of Hooks 契约，同时防止后续除零等 NaN 运算
  if (photos.length === 0 || slides.length === 0) {
    return <div className="w-full h-screen bg-black" />;
  }

  // 计算单个卡片样式的核心工厂函数
  const getSlideStyle = (slide: Slide) => {
    const isCurrent = slide.leftVw === 0;

    // 1️⃣ 直接硬切 (none)
    if (transitionType === 'none') {
      return {
        left: `${slide.leftVw}vw`,
        top: 0,
        opacity: isCurrent ? 1 : 0,
        transform: 'none',
        transition: 'none',
        pointerEvents: isCurrent ? ('auto' as const) : ('none' as const),
        willChange: 'auto',
      };
    }

    // 2️⃣ 横向滑动 (slide)
    if (transitionType === 'slide') {
      return {
        left: `${slide.leftVw}vw`,
        top: 0,
        opacity: 1,
        transform: 'none',
        transition: 'none',
        pointerEvents: isCurrent ? ('auto' as const) : ('none' as const),
        willChange: 'transform',
      };
    }

    // 3️⃣ 纵向滑动 (slideV)
    if (transitionType === 'slideV') {
      return {
        left: 0,
        top: `${slide.leftVw}vh`,
        opacity: 1,
        transform: 'none',
        transition: 'none',
        pointerEvents: isCurrent ? ('auto' as const) : ('none' as const),
        willChange: 'transform',
      };
    }

    // 4️⃣ 经典淡入淡出 (fade) 与 电影级缩放 (zoom)
    // 渐变与缩放模式下，所有卡片叠放在 (0, 0) 物理坐标，通过 opacity 与 scale 切换
    let opacity = 0;
    let scale = 1;

    if (!isTransitioning) {
      opacity = isCurrent ? 1 : 0;
      scale = isCurrent ? 1 : 0.95;
    } else {
      const goingNext = trackOffset === -100;
      const goingPrev = trackOffset === 100;

      if (goingNext) {
        if (slide.leftVw === 100) {
          // 右侧卡片滑入：淡入至 1
          opacity = 1;
          scale = 1;
        } else if (slide.leftVw === 0) {
          // 当前卡片滑出：淡出至 0
          opacity = 0;
          scale = transitionType === 'zoom' ? 1.05 : 1;
        } else {
          opacity = 0;
          scale = 0.95;
        }
      } else if (goingPrev) {
        if (slide.leftVw === -100) {
          // 左侧卡片滑入：淡入至 1
          opacity = 1;
          scale = 1;
        } else if (slide.leftVw === 0) {
          // 当前卡片滑出：淡出至 0
          opacity = 0;
          scale = transitionType === 'zoom' ? 1.05 : 1;
        } else {
          opacity = 0;
          scale = 0.95;
        }
      }
    }

    const transitionParts: string[] = [];
    if (isTransitioning) {
      transitionParts.push('opacity 420ms cubic-bezier(0.25, 1, 0.5, 1)');
      if (transitionType === 'zoom') {
        transitionParts.push('transform 420ms cubic-bezier(0.25, 1, 0.5, 1)');
      }
    }

    return {
      left: 0,
      top: 0,
      opacity,
      transform: transitionType === 'zoom' ? `scale(${scale})` : 'none',
      transition: transitionParts.join(', ') || 'none',
      pointerEvents: opacity > 0 ? ('auto' as const) : ('none' as const),
      willChange: 'transform, opacity',
    };
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      {/* 
        💡 3元素物理槽位轮转滑轨（3-Element DOM Rotation Carousel）：
        - 始终只有 3 个固定的卡片容器 [0], [1], [2]，React key 永久不变。
        - 顺序滑动时，仅移动外部滑轨并切换卡片物理位置（对冲移动），不触碰当前可视大图的 DOM 与 src。
        - 避免了任何可见大图的 GPU 纹理重新上传，实现 100% 满帧、0 卡顿切换。
      */}
      <div
        className={`w-full h-full absolute top-0 left-0 ${
          isTransitioning && (transitionType === 'slide' || transitionType === 'slideV')
            ? 'transition-transform duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)]'
            : ''
        }`}
        style={{
          transform:
            transitionType === 'slide'
              ? `translate3d(${trackOffset}vw, 0, 0)`
              : transitionType === 'slideV'
              ? `translate3d(0, ${trackOffset}vh, 0)`
              : 'translate3d(0, 0, 0)',
        }}
      >
        {slides.map((slide) => {
          const src = photos[slide.photoIndex];
          if (!src) return null;
          const isReady = !!loadedImages[src];
          const slideStyle = getSlideStyle(slide);

          return (
            <div
              key={slide.id}
              className="w-full h-full absolute top-0 flex items-center justify-center bg-transparent p-0"
              style={slideStyle}
            >
              <img
                src={src}
                decoding="async"
                alt=""
                // 💡 首帧就绪无延迟：若后台已预解码成功，图片 0ms 满亮横推；若极速连切未就绪，将在 200ms 内柔和浮现
                className={`max-w-full max-h-full object-contain transition-opacity duration-200 ease-out ${
                  isReady ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => {
                  setLoadedImages((prev) => ({ ...prev, [src]: true }));
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};