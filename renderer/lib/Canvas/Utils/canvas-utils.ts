import { FillStyle } from '../Core/types';

export function shouldFill(color: FillStyle) {
  if (typeof color !== 'string') return false;
  return color !== 'transparent' && color !== 'rgba(0, 0, 0, 0)';
}

export function shouldStroke(color: FillStyle, width: number) {
  return width > 0 && color !== 'transparent' && color !== 'rgba(0, 0, 0, 0)';
}
