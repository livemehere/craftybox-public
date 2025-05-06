import { Application, Container } from 'pixi.js';

import { PIXI_CUSTOM_EVENTS } from '@/lib/pixi-core/pixi-custom-events';

export function setDraggable(app: Application, target: Container) {
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let originalObjX = 0;
  let originalObjY = 0;

  const handleDown = (e: PointerEvent) => {
    const bounds = app.canvas.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;

    isDragging = true;
    startX = x;
    startY = y;
    originalObjX = target.x;
    originalObjY = target.y;
  };

  const handleMove = (e: PointerEvent) => {
    if (!isDragging) return;

    const bounds = app.canvas.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;

    const dx = (x - startX) / app.stage.scale.x;
    const dy = (y - startY) / app.stage.scale.y;

    target.x = originalObjX + dx;
    target.y = originalObjY + dy;

    target.emit(PIXI_CUSTOM_EVENTS.CONTAINER_DRAG);
    target.emit(PIXI_CUSTOM_EVENTS.CONTAINER_UPDATE);
  };

  const handleUp = () => {
    isDragging = false;
  };

  app.canvas.addEventListener('pointerdown', handleDown);
  app.canvas.addEventListener('pointermove', handleMove);
  app.canvas.addEventListener('pointerup', handleUp);

  return () => {
    app.canvas.removeEventListener('pointerdown', handleDown);
    app.canvas.removeEventListener('pointermove', handleMove);
    app.canvas.removeEventListener('pointerup', handleUp);
  };
}
