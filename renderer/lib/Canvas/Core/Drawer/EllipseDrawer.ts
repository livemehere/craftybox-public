import Layer from '../Layer/Core/Layer';

import Drawer, { DrawerOptions } from './index';

export type EllipseDrawerOptions = DrawerOptions;

export default class EllipseDrawer extends Drawer {
  constructor(props: EllipseDrawerOptions) {
    super(props);
  }

  protected _drawPath(ctx: CanvasRenderingContext2D, layer: Layer): void {
    const { width, height } = layer;
    if (width <= 0 || height <= 0) return;
    ctx.beginPath();
    ctx.ellipse(0, 0, width / 2, height / 2, 0, 0, Math.PI * 2);
    ctx.closePath();
  }
}
