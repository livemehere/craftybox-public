import { usePixiEffect } from '@/lib/pixi-design-editor/hooks/usePixiEffect';

/**
 * @description zoom `app.stage` based on current mouse position using wheel event
 */
const WheelController = ({ enable = true }: { enable?: boolean }) => {
  // zoom
  usePixiEffect(
    (app) => {
      if (!enable) return;

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();

        const scaleStep = 0.1;
        const minScale = 0.1;
        const maxScale = 5;
        const panStep = 40;

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
    [enable]
  );
  return null;
};

export default WheelController;
