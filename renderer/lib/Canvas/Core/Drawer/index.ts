import { FillStyle } from '../types';
import Layer from '../Layer/Core/Layer';
import { shouldFill, shouldStroke } from '../../Utils/canvas-utils';

export interface DrawerOptions {
  fillStyle?: FillStyle;
  strokeStyle?: FillStyle;
  strokeWidth?: number;
  dash?: number[];
  dashOffset?: number;
  showBounds?: boolean;
  boundsStrokeStyle?: FillStyle;
  boundsStrokeWidth?: number;
}

export interface IDrawer {
  readonly drawer: Drawer;
  readonly hitDrawer: Drawer;
}

interface DrawOptions {
  clipChildren?: boolean;
}

export default abstract class Drawer {
  fillStyle: FillStyle;
  strokeStyle: FillStyle;
  strokeWidth: number;
  dashOffset: number;
  dash?: number[];
  showBounds: boolean;
  boundsStrokeStyle: FillStyle;
  boundsStrokeWidth: number;

  protected constructor({
    fillStyle = 'transparent',
    strokeStyle = 'transparent',
    strokeWidth = 0,
    dash,
    dashOffset = 0,
    showBounds = false,
    boundsStrokeStyle = 'red',
    boundsStrokeWidth = 1,
  }: DrawerOptions) {
    this.fillStyle = fillStyle;
    this.strokeStyle = strokeStyle;
    this.strokeWidth = strokeWidth;
    this.dash = dash;
    this.dashOffset = dashOffset;
    this.showBounds = showBounds;
    this.boundsStrokeStyle = boundsStrokeStyle;
    this.boundsStrokeWidth = boundsStrokeWidth;
  }

  /*
   * must draw with center anchor
   * */
  protected abstract _drawPath(
    ctx: CanvasRenderingContext2D,
    layer: Layer
  ): void;

  private drawBonds(ctx: CanvasRenderingContext2D, layer: Layer) {
    const { width, height } = layer;
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = this.boundsStrokeStyle;
    ctx.lineWidth = this.boundsStrokeWidth;
    ctx.rect(-width / 2, -height / 2, width, height);
    ctx.stroke();
    ctx.restore();
  }

  protected setupStroke(ctx: CanvasRenderingContext2D) {
    if (this.dash) {
      ctx.setLineDash(this.dash);
      ctx.lineDashOffset = this.dashOffset;
    }
    if (this.strokeWidth) {
      ctx.strokeStyle = this.strokeStyle;
      ctx.lineWidth = this.strokeWidth;
    }
  }

  protected setupFill(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.fillStyle;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    layer: Layer,
    renderChildren?: () => void,
    options?: DrawOptions
  ) {
    const { x, y, width, height, rotate, scale } = layer;

    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate(rotate);
    ctx.scale(scale, scale);

    ctx.save();
    this._drawPath(ctx, layer);

    if (shouldFill(this.fillStyle)) {
      this.setupFill(ctx);
      ctx.fill();
    }

    if (shouldStroke(this.strokeStyle, this.strokeWidth)) {
      this.setupStroke(ctx);
      ctx.stroke();
    }

    ctx.restore();

    if (renderChildren) {
      if (options?.clipChildren) {
        ctx.clip();
      }
      ctx.translate(-width / 2, -height / 2);
      renderChildren();
    }

    if (this.showBounds) {
      this.drawBonds(ctx, layer);
    }

    ctx.restore();
  }
}
