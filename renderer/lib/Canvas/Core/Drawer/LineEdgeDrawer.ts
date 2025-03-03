import LineLayer from '../Layer/Shapes/LineLayer';

import Drawer, { DrawerOptions } from './index';

export type LineEdgeDrawerOptions = DrawerOptions & {
  startEdge: boolean;
  endEdge: boolean;
  arrowSize: number;
  padding?: number;
};

export default class LineEdgeDrawer extends Drawer {
  start: boolean;
  end: boolean;
  size: number;
  padding: number;

  constructor(props: LineEdgeDrawerOptions) {
    super(props);
    this.start = props.startEdge;
    this.end = props.endEdge;
    this.size = props.arrowSize;
    this.padding = props.padding ?? 0;
  }

  protected _drawPath(ctx: CanvasRenderingContext2D, layer: LineLayer): void {
    const { x1, y1, x2, y2 } = layer;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);

    const directionX = dx / length;
    const directionY = dy / length;

    const startX = x1 + directionX * this.padding;
    const startY = y1 + directionY * this.padding;
    const endX = x2 - directionX * this.padding;
    const endY = y2 - directionY * this.padding;

    const centerX = (startX + endX) / 2;
    const centerY = (startY + endY) / 2;

    ctx.beginPath();

    const startPos = { x: startX - centerX, y: startY - centerY };
    const endPos = { x: endX - centerX, y: endY - centerY };

    if (this.start) {
      ctx.save();
      ctx.translate(startPos.x, startPos.y);
      ctx.rotate(Math.atan2(endPos.y - startPos.y, endPos.x - startPos.x));
      ctx.moveTo(0, 0);
      ctx.lineTo(this.size, this.size);
      ctx.lineTo(this.size, -this.size);
      ctx.lineTo(0, 0);
      ctx.restore();
    }

    if (this.end) {
      ctx.save();
      ctx.translate(endPos.x, endPos.y);
      ctx.rotate(Math.atan2(startPos.y - endPos.y, startPos.x - endPos.x));
      ctx.moveTo(0, 0);
      ctx.lineTo(this.size, this.size);
      ctx.lineTo(this.size, -this.size);
      ctx.lineTo(0, 0);
      ctx.restore();
    }
  }
}
