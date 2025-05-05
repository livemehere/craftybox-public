import { useAtom, useAtomValue } from 'jotai';
import { Graphics, Point } from 'pixi.js';

import {
  exportContainerAtom,
  modeAtom,
  selectedObjAtom,
} from '@/lib/pixi-design-editor/stores';
import { usePixiEffect } from '@/lib/pixi-design-editor/hooks/usePixiEffect';
import { PIXI_CUSTOM_EVENTS } from '@/lib/pixi-design-editor/custom-events';

const InteractionController = () => {
  const editingContainer = useAtomValue(exportContainerAtom);
  const [mode, setMode] = useAtom(modeAtom);
  const selectedObj = useAtomValue(selectedObjAtom);

  /** drag and drop */
  usePixiEffect(
    (app) => {
      if (!selectedObj || mode !== 'select') return;

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
        originalObjX = selectedObj.x;
        originalObjY = selectedObj.y;
      };

      const handleMove = (e: PointerEvent) => {
        if (!isDragging) return;

        const bounds = app.canvas.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;

        const dx = (x - startX) / app.stage.scale.x;
        const dy = (y - startY) / app.stage.scale.y;

        selectedObj.x = originalObjX + dx;
        selectedObj.y = originalObjY + dy;

        selectedObj.emit(PIXI_CUSTOM_EVENTS.CONTAINER_UPDATE);
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
    },
    [selectedObj, mode]
  );

  /** create shapes */
  usePixiEffect(
    (app) => {
      if (mode === 'move' || mode === 'select') return;
      if (!editingContainer) return;

      let isDrawing = false;
      let graphics: Graphics;

      console.log('start mode', mode);
      const handleDown = (e: PointerEvent) => {
        isDrawing = true;
        graphics = new Graphics();

        const bounds = app.canvas.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;
        const localPos = app.stage.toLocal(new Point(x, y));
        graphics.position.set(localPos.x, localPos.y);
        editingContainer.addChild(graphics);
        console.log('added graphics', graphics.x, graphics.y);
      };

      const handleMove = (e: PointerEvent) => {
        if (!isDrawing) return;

        const bounds = app.canvas.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;
        const localPos = app.stage.toLocal(new Point(x, y));
        const dx = localPos.x - graphics.x;
        const dy = localPos.y - graphics.y;

        switch (mode) {
          case 'draw-rect':
            graphics.clear();
            graphics.rect(0, 0, dx, dy).stroke({
              width: 4,
              color: '#ff0000',
              alignment: 1,
            });

            break;
          default:
            throw new Error('invalid drawing mode: ' + mode);
        }
      };

      const handleUp = () => {
        isDrawing = false;
      };

      app.canvas.addEventListener('pointerdown', handleDown);
      app.canvas.addEventListener('pointermove', handleMove);
      app.canvas.addEventListener('pointerup', handleUp);

      return () => {
        app.canvas.removeEventListener('pointerdown', handleDown);
        app.canvas.removeEventListener('pointermove', handleMove);
        app.canvas.removeEventListener('pointerup', handleUp);
      };
    },
    [mode, editingContainer]
  );
  return null;
};

export default InteractionController;
