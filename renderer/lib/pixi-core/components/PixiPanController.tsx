import { usePixiEffect } from '@/lib/pixi-core/hooks/usePixiEffect';

interface Props {
  enable?: boolean;
  applyCursor?: boolean;
}

const PixiPanController = ({ enable = true, applyCursor = true }: Props) => {
  // pan
  usePixiEffect(
    (app) => {
      const setCursor = (canvas: HTMLCanvasElement, cursor: string) => {
        if (applyCursor) {
          canvas.style.cursor = cursor;
        }
      };

      if (!enable) {
        setCursor(app.canvas, 'default');
        return;
      }
      setCursor(app.canvas, 'grab');
      let isDown = false;
      let startX: number;
      let startY: number;

      const onMouseDown = (e: MouseEvent) => {
        isDown = true;
        startX = e.clientX;
        startY = e.clientY;
        setCursor(app.canvas, 'grabbing');
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
        setCursor(app.canvas, 'grab');
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
    [enable, applyCursor]
  );

  return null;
};

export default PixiPanController;
