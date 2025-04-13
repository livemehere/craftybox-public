import { Point } from '../types';

export interface Bounds {
  t: number;
  r: number;
  b: number;
  l: number;
}

export default class Bound {
  static createBounds(
    x: number,
    y: number,
    width: number,
    height: number
  ): Bounds {
    return {
      t: height > 0 ? y : y + height,
      r: width > 0 ? x + width : x,
      b: height > 0 ? y + height : y,
      l: width > 0 ? x : x + width,
    };
  }

  static setOffset(bounds: Bounds, point: Point) {
    bounds.l += point.x;
    bounds.r += point.x;
    bounds.t += point.y;
    bounds.b += point.y;
  }

  /**
   * scale up from center anchor
   * left,top : reduce
   * right,bottom : expand
   */
  static setScale(bounds: Bounds, scale: number) {
    const w = bounds.r - bounds.l;
    const h = bounds.b - bounds.t;

    const newW = w * scale;
    const newH = h * scale;

    const wDiff = newW - w;
    const hDiff = newH - h;

    bounds.l -= wDiff / 2;
    bounds.t -= hDiff / 2;
    bounds.r += wDiff / 2;
    bounds.b += hDiff / 2;
  }

  static getBounds(values: number[]): Bounds {
    if (values.length < 1 || values.length > 4) return Bound.getBounds([0]);
    const idx = [
      [0, 0, 0, 0],
      [0, 1, 0, 1],
      [0, 1, 2, 1],
      [0, 1, 2, 3],
    ][values.length - 1];
    return {
      t: values[idx[0]],
      r: values[idx[1]],
      b: values[idx[2]],
      l: values[idx[3]],
    };
  }
}
