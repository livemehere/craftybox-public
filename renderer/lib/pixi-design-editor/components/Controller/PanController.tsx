import { usePixiEffect } from '@/lib/pixi-design-editor/hooks/usePixiEffect';

const PanController = ({ enable = true }: { enable?: boolean }) => {
  // pan
  usePixiEffect(
    (app) => {
      if (!enable) {
        app.stage.cursor = 'default';
        return;
      }
      app.stage.cursor = 'grab';
      let isDown = false;
      let startX: number;
      let startY: number;

      const onMouseDown = (e: MouseEvent) => {
        isDown = true;
        startX = e.clientX;
        startY = e.clientY;
        app.stage.cursor = 'grabbing';
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
        app.stage.cursor = 'grab';
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
