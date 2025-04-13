import { LayerOptions } from '../Core/Layer';
import RectDrawer, { RectDrawerOptions } from '../../Drawer/RectDrawer';
import { Bounds } from '../../Bounds';
import ContainerLayer from './ContainerLayer';

export type GroupLayerOptions = Omit<
  LayerOptions,
  'x' | 'y' | 'width' | 'height' | 'scale' | 'rotate'
> &
  RectDrawerOptions;

export default class GroupLayer extends ContainerLayer {
  readonly type = 'group';
  readonly drawer: RectDrawer;
  readonly hitDrawer: RectDrawer;

  constructor(props?: GroupLayerOptions) {
    super(props ?? {});
    this.drawer = new RectDrawer(props ?? {});
    this.hitDrawer = new RectDrawer({
      fillStyle: this.id,
    });
    this.addTag('group');
  }

  override get scale() {
    return this._scale;
  }

  override get rotate() {
    return this._rotate;
  }

  override set scale(v: number) {
    throw new Error('Cannot set scale of a group layer');
  }

  override set rotate(v: number) {
    throw new Error('Cannot set rotate of a group layer');
  }

  get x(): number {
    let minL = Infinity;
    this.children.forEach((c) => {
      const bounds = c.getBounds();
      minL = Math.min(minL, bounds.l);
    });
    return minL;
  }

  set x(v: number) {
    const diff = v - this.x;
    this.children.forEach((c) => {
      c.x += diff;
    });
  }

  get y(): number {
    let minT = Infinity;
    this.children.forEach((c) => {
      const bounds = c.getBounds();
      minT = Math.min(minT, bounds.t);
    });
    return minT;
  }

  set y(v: number) {
    const diff = v - this.y;
    this.children.forEach((c) => {
      c.y += diff;
    });
  }

  get width() {
    let minL = Infinity;
    let maxR = -Infinity;
    this.children.forEach((c) => {
      const bounds = c.getBounds();
      minL = Math.min(minL, bounds.l);
      maxR = Math.max(maxR, bounds.r);
    });
    return maxR - minL;
  }

  set width(v: number) {
    throw new Error('Cannot set width of a group layer');
  }

  get height() {
    let minT = Infinity;
    let maxB = -Infinity;
    this.children.forEach((c) => {
      const bounds = c.getBounds();
      minT = Math.min(minT, bounds.t);
      maxB = Math.max(maxB, bounds.b);
    });
    return maxB - minT;
  }

  set height(v: number) {
    throw new Error('Cannot set height of a group layer');
  }

  override getClientBoundRect(): Bounds {
    const bounds: Bounds = {
      l: Infinity,
      t: Infinity,
      r: -Infinity,
      b: -Infinity,
    };
    this.children.forEach((c) => {
      const childBounds = c.getClientBoundRect();
      bounds.l = Math.min(bounds.l, childBounds.l);
      bounds.t = Math.min(bounds.t, childBounds.t);
      bounds.r = Math.max(bounds.r, childBounds.r);
      bounds.b = Math.max(bounds.b, childBounds.b);
    });
    return bounds;
  }

  _render(ctx: CanvasRenderingContext2D) {
    this.drawer.draw(ctx, this);
    this.children.forEach((c) => c.render(ctx));
  }

  _renderHitArea(ctx: CanvasRenderingContext2D) {
    this.hitDrawer.draw(ctx, this);
    this.children.forEach((c) => c.renderHitArea(ctx));
  }
}
