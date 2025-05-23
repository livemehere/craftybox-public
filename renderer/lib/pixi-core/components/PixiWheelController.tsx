import { usePixiEffect } from '@/lib/pixi-core/hooks/usePixiEffect';

/**
 * @description zoom `app.stage` based on current mouse position using wheel event
 */
const PixiWheelController = ({
  enable = true,
  scaleStep = 0.1,
  minScale = 0.1,
  maxScale = 5,
  panStep = 40,
}: {
  enable?: boolean;
  scaleStep?: number;
  minScale?: number;
  maxScale?: number;
  panStep?: number;
}) => {
  // zoom
  usePixiEffect(
    (app) => {
      if (!enable) return;

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();

        const isCtrl = e.ctrlKey || e.metaKey;
        const isShift = e.shiftKey;

        const stage = app.stage;

        if (isCtrl) {
          /** 🔍 Zoom (Scale In/Out) **/
          const direction = e.deltaY > 0 ? -1 : 1;
          const oldScale = stage.scale.x;
          const newScale = Math.min(
            maxScale,
            Math.max(minScale, oldScale + direction * scaleStep)
          );

          const anchorPos = app.renderer.events.pointer.global;
          const localPos = stage.toLocal(anchorPos);

          stage.scale.set(newScale);

          const newGlobalPos = stage.toGlobal(localPos);
          const dx = anchorPos.x - newGlobalPos.x;
          const dy = anchorPos.y - newGlobalPos.y;

          stage.position.x += dx;
          stage.position.y += dy;
        } else if (isShift) {
          /** ↔ Horizontal Pan **/
          stage.position.x -= e.deltaX > 0 ? panStep : -panStep;
        } else {
          /** ↕ Vertical Pan **/
          stage.position.y -= e.deltaY > 0 ? panStep : -panStep;
        }
      };

      app.canvas.addEventListener('wheel', onWheel, { passive: false });

      return () => {
        app.canvas.removeEventListener('wheel', onWheel);
      };
    },
    [enable, scaleStep, minScale, maxScale, panStep]
  );
  return null;
};

export default PixiWheelController;
