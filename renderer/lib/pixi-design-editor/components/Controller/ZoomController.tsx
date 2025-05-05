import { usePixiEffect } from '@/lib/pixi-design-editor/hooks/usePixiEffect';

/**
 * @description zoom `app.stage` based on current mouse position using wheel event
 */
const ZoomController = ({ enable = true }: { enable?: boolean }) => {
  // zoom
  usePixiEffect(
    (app) => {
      if (!enable) return;
      const onWheel = (e: WheelEvent) => {
        e.preventDefault();

        const isCtrl = e.ctrlKey || e.metaKey;
        if (!isCtrl) return;

        const scaleStep = 0.1;
        const minScale = 0.1;
        const maxScale = 5;

        // 현재 스케일
        const oldScale = app.stage.scale.x;
        const direction = e.deltaY > 0 ? -1 : 1;
        const newScale = Math.min(
          maxScale,
          Math.max(minScale, oldScale + direction * scaleStep)
        );

        const anchorPos = app.renderer.events.pointer.global;
        const localPos = app.stage.toLocal(anchorPos);

        app.stage.scale.set(newScale);

        const newGlobalPos = app.stage.toGlobal(localPos);
        const dx = anchorPos.x - newGlobalPos.x;
        const dy = anchorPos.y - newGlobalPos.y;

        app.stage.position.x += dx;
        app.stage.position.y += dy;
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

export default ZoomController;
