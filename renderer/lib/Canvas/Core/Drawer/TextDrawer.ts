import TextLayer from '../Layer/Shapes/TextLayer';
import { shouldFill, shouldStroke } from '../../Utils/canvas-utils';

import Drawer, { DrawerOptions } from './index';

export type TextDrawerOptions = DrawerOptions & {
  showCursor?: boolean;
  cursorInterval?: number;
  cursorColor?: string;
  cursorWidth?: number;
  cursorOffset?: number;
};

export default class TextDrawer extends Drawer {
  showCursor: boolean;
  cursorInterval: number;
  cursorColor: string;
  cursorWidth: number;
  cursorOffset: number;

  private cursorStartTime: number = Date.now();

  constructor(props: TextDrawerOptions) {
    super(props);
    this.showCursor = props.showCursor || false;
    this.cursorInterval = props.cursorInterval || 1000;
    this.cursorColor = props.cursorColor || 'white';
    this.cursorWidth = props.cursorWidth || 2;
    this.cursorOffset = props.cursorOffset || 0;
  }
  protected _drawPath(ctx: CanvasRenderingContext2D, layer: TextLayer): void {
    const { width, height, maxWidth, align } = layer;

    ctx.beginPath();
    this.setupFill(ctx);
    this.setupStroke(ctx);

    layer._lines.forEach((line, index) => {
      const textHeight = layer.fontSize * layer.lineHeight;
      let x = -width / 2;
      const y = -height / 2 + textHeight * index;

      if (align === 'center') {
        const textWidth = ctx.measureText(line).width;
        x = -textWidth / 2;
      }

      if (align === 'right') {
        if (!maxWidth) {
          throw new Error('maxWidth is required when align is right');
        }
        const textWidth = ctx.measureText(line).width;
        x = maxWidth / 2 - textWidth;
      }

      if (shouldFill(this.fillStyle)) {
        ctx.fillText(line, x, y);
      }
      if (shouldStroke(this.strokeStyle, this.strokeWidth)) {
        ctx.strokeText(line, x, y);
      }

      if (index === layer._lines.length - 1 && this.showCursor) {
        const diff = Date.now() - this.cursorStartTime;
        if (diff % this.cursorInterval < this.cursorInterval / 2) {
          return;
        }
        const curX = x + ctx.measureText(line).width + this.cursorOffset;
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = this.cursorColor;
        ctx.lineWidth = this.cursorWidth;
        ctx.moveTo(curX, y);
        ctx.lineTo(curX, y + textHeight);
        ctx.stroke();
        ctx.restore();
      }
    });
  }
}
