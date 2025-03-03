import LineLayer from '../Layer/Shapes/LineLayer';

import Drawer, { DrawerOptions } from './index';

export type LineDrawerOptions = DrawerOptions;

export default class LineDrawer extends Drawer {
  constructor(props: LineDrawerOptions) {
    super(props);
  }

  protected _drawPath(ctx: CanvasRenderingContext2D, layer: LineLayer): void {
    const { x1, y1, x2, y2 } = layer;
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
    ctx.beginPath();
    ctx.moveTo(x1 - centerX, y1 - centerY);
    ctx.lineTo(x2 - centerX, y2 - centerY);
  }
}
