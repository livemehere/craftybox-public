import { Graphics } from 'pixi.js';

import { usePixiEffect } from '@/lib/pixi-design-editor/hooks/usePixiEffect';

/**
 * display infinite grid background
 */
const Grid = () => {
  usePixiEffect((app) => {
    const g = new Graphics();
    g.alpha = 0.2;
    g.label = 'Grid Background';
    app.stage.addChild(g);

    // center point (0,0)
    const centerPoint = new Graphics();
    centerPoint.label = 'Center (0,0)';
    centerPoint.pivot.set(2.5, 2.5);
    centerPoint.rect(0, 0, 5, 5).fill('red');
    app.stage.addChild(centerPoint);

    const centerLine = new Graphics();
    centerLine.label = 'Axis';
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

    const ticker = app.ticker.add(update);

    return () => {
      ticker.destroy();
      g.destroy();
    };
  });
  return null;
};

export default Grid;
