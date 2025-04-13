import ImageLayer from '../Layer/Shapes/ImageLayer';

import Drawer, { DrawerOptions } from './index';

export type ImageDrawerOptions = DrawerOptions;

export default class ImageDrawer extends Drawer {
  constructor(props: ImageDrawerOptions) {
    super(props);
  }
  protected _drawPath(ctx: CanvasRenderingContext2D, layer: ImageLayer): void {
    const { width, height, _image } = layer;
    if (!_image) return;
    ctx.beginPath();
    ctx.drawImage(_image, -width / 2, -height / 2, width, height);
    ctx.closePath();
  }
}
