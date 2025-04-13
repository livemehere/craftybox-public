import { Rounds } from '../types';
import Layer from '../Layer/Core/Layer';

import Drawer, { DrawerOptions } from './index';

export type RectDrawerOptions = DrawerOptions & {
  rounds?: Rounds;
};

export default class RectDrawer extends Drawer {
  rounds?: Rounds;
  constructor({ rounds, ...props }: RectDrawerOptions) {
    super(props);
    this.rounds = rounds;
  }

  protected _drawPath(ctx: CanvasRenderingContext2D, layer: Layer) {
    const { width, height } = layer;

    ctx.beginPath();
    if (this.rounds?.lt) {
      ctx.moveTo(-width / 2, -height / 2 + this.rounds.lt);
      ctx.quadraticCurveTo(
        -width / 2,
        -height / 2,
        -width / 2 + this.rounds.lt,
        -height / 2
      );
    } else {
      ctx.moveTo(-width / 2, -height / 2);
    }

    if (this.rounds?.rt) {
      ctx.lineTo(width / 2 - this.rounds.rt, -height / 2);
      ctx.quadraticCurveTo(
        width / 2,
        -height / 2,
        width / 2,
        -height / 2 + this.rounds.rt
      );
    } else {
      ctx.lineTo(width / 2, -height / 2);
    }

    if (this.rounds?.rb) {
      ctx.lineTo(width / 2, height / 2 - this.rounds.rb);
      ctx.quadraticCurveTo(
        width / 2,
        height / 2,
        width / 2 - this.rounds.rb,
        height / 2
      );
    } else {
      ctx.lineTo(width / 2, height / 2);
    }

    if (this.rounds?.lb) {
      ctx.lineTo(-width / 2 + this.rounds.lb, height / 2);
      ctx.quadraticCurveTo(
        -width / 2,
        height / 2,
        -width / 2,
        height / 2 - this.rounds.lb
      );
    } else {
      ctx.lineTo(-width / 2, height / 2);
    }
    ctx.closePath();
  }
}
