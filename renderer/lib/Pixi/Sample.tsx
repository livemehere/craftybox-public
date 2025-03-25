import { useEffect, useRef } from 'react';
import { Application, Graphics } from 'pixi.js';

export default function Sample() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const run = async () => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const app = new Application();
    await app.init({
      canvas: canvasEl,
      width: 800,
      height: 500,
      eventMode: 'static'
    });

    // Create 100 circles with random positions and lerp values
    const circles: { graphics: Graphics; mx: number; my: number; lerpValue: number }[] = [];

    for (let i = 0; i < 100; i++) {
      const circle = new Graphics();
      const centerX = Math.random() * app.screen.width;
      const centerY = Math.random() * app.screen.height;
      circle.ellipse(0, 0, 5, 5).fill('white');
      circle.x = centerX;
      circle.y = centerY;
      app.stage.addChild(circle);

      circles.push({
        graphics: circle,
        mx: centerX,
        my: centerY,
        lerpValue: 0.1 + Math.random() * 0.2 // Random lerp value between 0.1 and 0.3
      });
    }

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t;
    }

    app.ticker.add(() => {
      circles.forEach((circle) => {
        circle.graphics.x = lerp(circle.graphics.x, circle.mx, circle.lerpValue);
        circle.graphics.y = lerp(circle.graphics.y, circle.my, circle.lerpValue);
      });
    });

    const rect = app.canvas.getBoundingClientRect();

    app.canvas.addEventListener('mousemove', (e) => {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Update target position for all circles
      circles.forEach((circle) => {
        circle.mx = x;
        circle.my = y;
      });
    });
  };
  useEffect(() => {
    run();
  }, []);
  return (
    <div>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
