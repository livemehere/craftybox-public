import { usePixiEffect } from '@/lib/pixi/hooks/usePixiEffect';

const PanController = ({ enable = true }: { enable?: boolean }) => {
  // pan
  usePixiEffect(
    (app) => {
      if (!enable) {
        document.body.style.cursor = 'default';
        return;
      }
      document.body.style.cursor = 'grab';
      let isDown = false;
      let startX: number;
      let startY: number;

      const onMouseDown = (e: MouseEvent) => {
        isDown = true;
        startX = e.clientX;
        startY = e.clientY;
        document.body.style.cursor = 'grabbing';
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!isDown) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        app.stage.x += dx;
        app.stage.y += dy;
        startX = e.clientX;
        startY = e.clientY;
      };

      const onMouseUp = () => {
        isDown = false;
        document.body.style.cursor = 'grab';
      };

      window.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);

      return () => {
        window.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
    },
    [enable]
  );

  return null;
};

export default PanController;
