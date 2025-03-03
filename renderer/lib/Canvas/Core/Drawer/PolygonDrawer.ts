import Layer from '../Layer/Core/Layer';
import { Point } from '../types';

import Drawer, { DrawerOptions } from './index';

export type PolygonDrawerOptions = DrawerOptions & {
  round?: number;
  sides: number;
};

export default class PolygonDrawer extends Drawer {
  round?: number;
  sides: number;

  private prevRound?: number;
  private prevSides?: number;
  private p1: Point[] = [];
  private p2: Point[] = [];
  private p3: Point[] = [];

  constructor(props: PolygonDrawerOptions) {
    super(props);
    this.round = props.round;
    this.sides = props.sides;
  }

  private _getX = (radius: number, angle: number) => radius * Math.sin(angle);
  private _getY = (radius: number, angle: number) => -radius * Math.cos(angle);
  private createPoints = (radiusX: number, radiusY: number, angle: number, rotate: number) => {
    return Array.from({ length: this.sides }, (_, i) => {
      const x = this._getX(radiusX, angle * i + rotate);
      const y = this._getY(radiusY, angle * i + rotate);
      return { x, y };
    });
  };

  private savePoints(radiusX: number, radiusY: number, angle: number) {
    if (this.sides !== this.prevSides || this.round !== this.prevRound) {
      this.p1 = this.createPoints(radiusX, radiusY, angle, 0);
      if (this.round) {
        const angleOffset = Math.max(0.1, Math.min(Math.PI / this.sides, this.round));
        const rx = radiusX * 0.8;
        const ry = radiusY * 0.8;
        this.p2 = this.createPoints(rx, ry, angle, -angleOffset);
        this.p3 = this.createPoints(rx, ry, angle, +angleOffset);
      }
      this.prevRound = this.round;
      this.prevSides = this.sides;
    }
  }

  protected _drawPath(ctx: CanvasRenderingContext2D, layer: Layer): void {
    const { width, height } = layer;

    const radiusX = width / 2;
    const radiusY = height / 2;
    const angle = (Math.PI * 2) / this.sides;
    this.savePoints(radiusX, radiusY, angle);

    ctx.beginPath();
    for (let i = 0; i < this.sides; i++) {
      if (this.round) {
        if (i === 0) {
          ctx.moveTo(this.p2[i].x, this.p2[i].y);
          ctx.quadraticCurveTo(this.p1[i].x, this.p1[i].y, this.p3[i].x, this.p3[i].y);
        } else {
          ctx.lineTo(this.p2[i].x, this.p2[i].y);
          ctx.quadraticCurveTo(this.p1[i].x, this.p1[i].y, this.p3[i].x, this.p3[i].y);
        }
      } else {
        if (i === 0) {
          ctx.moveTo(this.p1[i].x, this.p1[i].y);
        } else {
          ctx.lineTo(this.p1[i].x, this.p1[i].y);
        }
      }
    }
    ctx.closePath();
  }
}
