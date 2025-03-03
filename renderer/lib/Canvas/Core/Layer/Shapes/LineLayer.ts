import { LayerOptions } from '../Core/Layer';
import LineDrawer, { LineDrawerOptions } from '../../Drawer/LineDrawer';
import InteractionLayer from '../Core/InteractionLayer';
import { LayerType } from '../../types';

export type LineLayerOptions = Omit<LayerOptions, 'x' | 'y' | 'width' | 'height'> &
  LineDrawerOptions & {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };

export default class LineLayer extends InteractionLayer {
  readonly type: LayerType = 'line';
  readonly drawer: LineDrawer;
  readonly hitDrawer: LineDrawer;

  x1: number;
  y1: number;
  x2: number;
  y2: number;

  constructor(props: LineLayerOptions) {
    const minX = Math.min(props.x1, props.x2);
    const minY = Math.min(props.y1, props.y2);
    const maxX = Math.max(props.x1, props.x2);
    const maxY = Math.max(props.y1, props.y2);

    super({
      ...props,
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    });
    this.drawer = new LineDrawer(props);
    this.hitDrawer = new LineDrawer({
      ...props,
      fillStyle: this.id,
      strokeStyle: this.id,
      dash: undefined
    });

    this.x1 = props.x1;
    this.y1 = props.y1;
    this.x2 = props.x2;
    this.y2 = props.y2;
  }

  override get x(): number {
    return Math.min(this.x1, this.x2);
  }

  override set x(v: number) {
    const diff = v - this.x;
    this.x1 += diff;
    this.x2 += diff;
  }

  override get y(): number {
    return Math.min(this.y1, this.y2);
  }

  override set y(v: number) {
    const diff = v - this.y;
    this.y1 += diff;
    this.y2 += diff;
  }

  override get width(): number {
    return Math.abs(this.x1 - this.x2);
  }

  override set width(v: number) {
    if (this.x1 < this.x2) {
      this.x2 = this.x1 + v;
    } else {
      this.x1 = this.x2 + v;
    }
  }

  override get height(): number {
    return Math.abs(this.y1 - this.y2);
  }

  override set height(v: number) {
    if (this.y1 < this.y2) {
      this.y2 = this.y1 + v;
    } else {
      this.y1 = this.y2 + v;
    }
  }

  _render(ctx: CanvasRenderingContext2D): void {
    this.drawer.draw(ctx, this);
  }

  _renderHitArea(ctx: CanvasRenderingContext2D): void {
    this.hitDrawer.draw(ctx, this);
  }
}
