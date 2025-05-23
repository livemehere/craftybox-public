import { Container, Graphics } from 'pixi.js';

import { usePixiEffect } from '@/lib/pixi-core/hooks/usePixiEffect';

export const GRID_CONTAINER_LABELS = {
  GRID_BACKGROUND: 'Grid Background',
  CENTER_POINT: 'Center (0,0)',
  CENTER_LINE: 'Axis',
};

interface Props {
  onCreated?: (containers: Container[]) => void;
}
const PixiGrid = ({ onCreated }: Props) => {
  usePixiEffect((app) => {
    const g = new Graphics();
    g.alpha = 0.2;
    g.label = GRID_CONTAINER_LABELS.GRID_BACKGROUND;
    app.stage.addChild(g);

    // center point (0,0)
    const centerPoint = new Graphics();
    centerPoint.label = GRID_CONTAINER_LABELS.CENTER_POINT;
    centerPoint.pivot.set(2.5, 2.5);
    centerPoint.rect(0, 0, 5, 5).fill('red');
    app.stage.addChild(centerPoint);

    const centerLine = new Graphics();
    centerLine.label = GRID_CONTAINER_LABELS.CENTER_LINE;
    centerLine.alpha = 0.5;
    app.stage.addChild(centerLine);

    const update = () => {
      g.clear();
      centerLine.clear();

      const gridSize = Math.pow(
        2,
        Math.round(Math.log2(100 / app.stage.scale.x))
      );
      const viewWidth = app.screen.width / app.stage.scale.x;
      const viewHeight = app.screen.height / app.stage.scale.y;

      const offsetX = -app.stage.position.x / app.stage.scale.x;
      const offsetY = -app.stage.position.y / app.stage.scale.y;

      const startX = Math.floor(offsetX / gridSize) * gridSize;
      const startY = Math.floor(offsetY / gridSize) * gridSize;
      const endX = offsetX + viewWidth;
      const endY = offsetY + viewHeight;

      for (let x = startX; x <= endX; x += gridSize) {
        g.moveTo(x, offsetY);
        g.lineTo(x, endY);
      }

      for (let y = startY; y <= endY; y += gridSize) {
        g.moveTo(offsetX, y);
        g.lineTo(endX, y);
      }

      g.stroke({
        pixelLine: true,
        width: 1,
        color: '#fff',
      });

      // center line
      centerLine.moveTo(0, offsetY);
      centerLine.lineTo(0, endY);
      centerLine.moveTo(offsetX, 0);
      centerLine.lineTo(endX, 0);

      centerLine.stroke({
        pixelLine: true,
        width: 1,
        color: '#fff',
      });

      centerPoint.scale.set(1 / app.stage.scale.x);
    };

    app.ticker.add(update);

    onCreated?.([g, centerPoint, centerLine]);

    return () => {
      app.ticker.remove(update);
      g.destroy();
    };
  });
  return null;
};

export default PixiGrid;
