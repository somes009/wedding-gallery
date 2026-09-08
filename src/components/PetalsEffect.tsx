import React, { useEffect, useRef } from 'react';

interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  angle: number;
  spin: number;
  opacity: number;
}

export const PetalsEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let petals: Petal[] = [];
    const maxPetals = 40; // 适中的数量，既美观又不遮挡照片

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 创建一片花瓣
    const createPetal = (isInit = false): Petal => {
      const size = Math.random() * 8 + 6; // 花瓣尺寸 6px - 14px
      return {
        x: Math.random() * canvas.width,
        // 如果是初始化，在屏幕中随机高度；如果是后续生成，从屏幕顶部上方飘入
        y: isInit ? Math.random() * canvas.height : -20,
        size,
        speedY: Math.random() * 0.8 + 0.6, // 缓慢飘落
        speedX: Math.random() * 0.4 - 0.2, // 微风左右摆动
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() * 0.01 + 0.005) * (Math.random() > 0.5 ? 1 : -1), // 自转
        opacity: Math.random() * 0.4 + 0.5, // 0.5 - 0.9 之间，若隐若现
      };
    };

    // 初始化花瓣
    for (let i = 0; i < maxPetals; i++) {
      petals.push(createPetal(true));
    }

    // 绘制一片粉嫩的樱花/玫瑰花瓣
    const drawPetal = (ctx: CanvasRenderingContext2D, petal: Petal) => {
      ctx.save();
      ctx.translate(petal.x, petal.y);
      ctx.rotate(petal.angle);
      ctx.beginPath();
      
      // 绘制心形或椭圆形的浪漫花瓣形状
      // 这里绘制一个精致的水滴花瓣形状
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-petal.size * 1.5, -petal.size * 1.5, -petal.size * 1.5, petal.size * 0.5, 0, petal.size * 1.5);
      ctx.bezierCurveTo(petal.size * 1.5, petal.size * 0.5, petal.size * 1.5, -petal.size * 1.5, 0, 0);
      
      // 梦幻淡粉色/玫瑰金渐变
      const gradient = ctx.createRadialGradient(-petal.size/4, -petal.size/4, 0, 0, 0, petal.size);
      gradient.addColorStop(0, `rgba(255, 192, 203, ${petal.opacity})`); // 粉红色
      gradient.addColorStop(0.8, `rgba(255, 140, 160, ${petal.opacity * 0.8})`); // 深粉红
      gradient.addColorStop(1, `rgba(255, 105, 180, 0)`); // 边缘渐变消失
      
      ctx.fillStyle = gradient;
      ctx.shadowColor = 'rgba(255, 182, 193, 0.3)';
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      petals.forEach((petal, index) => {
        // 更新位置
        petal.y += petal.speedY;
        // 加上正弦波动的微风效果
        petal.x += petal.speedX + Math.sin(petal.y / 30) * 0.2;
        petal.angle += petal.spin;

        // 如果超出屏幕底部或两侧，重新在顶部生成
        if (petal.y > canvas.height + 20 || petal.x < -20 || petal.x > canvas.width + 20) {
          petals[index] = createPetal(false);
        }

        // 绘制
        drawPetal(ctx, petal);
      });

      // 额外画一点点金色璀璨微尘，增加浪漫感
      ctx.fillStyle = 'rgba(255, 223, 137, 0.25)';
      for (let i = 0; i < 15; i++) {
        const x = (Math.sin(Date.now() * 0.0005 + i) * 0.5 + 0.5) * canvas.width;
        const y = ((Date.now() * 0.02 + i * 100) % canvas.height);
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-20 w-full h-full"
    />
  );
};