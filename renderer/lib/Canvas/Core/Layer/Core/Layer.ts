import { Emitter } from '@fewings/core/classes';

import { LayerType } from '../../types';
import Bound, { Bounds } from '../../Bounds';
import TextLayer from '../Shapes/TextLayer';
import LineLayer from '../Shapes/LineLayer';
import ContainerLayer from '../Container/ContainerLayer';

import InteractionLayer from './InteractionLayer';

import { ILayer } from '@/lib/Canvas/Core/interfaces';

export type LayerOptions = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  opacity?: number;
  visible?: boolean;
  scale?: number;
  rotate?: number;
  tags?: string | string[];
};

export type TLayerEventPayload = {
  target: InteractionLayer;
  currentTarget: InteractionLayer;
  pointerX: number;
  pointerY: number;
  startX: number | null;
  startY: number | null;
  stopPropagation: () => void;
};

export type TLayerEvents = {
  pointerdown: (e: TLayerEventPayload) => void;
  pointerup: (e: TLayerEventPayload) => void;
  pointermove: (e: TLayerEventPayload) => void;
  pointerenter: (e: TLayerEventPayload) => void;
  pointerleave: (e: TLayerEventPayload) => void;
  redraw: () => void;
  error: (e: Error) => void;
};

export interface Renderer {
  _render(ctx: CanvasRenderingContext2D): void;
}

export default abstract class Layer extends Emitter<TLayerEvents> implements ILayer, Renderer {
  _x = 0;
  _y = 0;
  _width = 0;
  _height = 0;
  opacity;
  _scale: number;
  _rotate: number;
  visible;

  parent: ContainerLayer | null = null;
  readonly tags: string[];

  abstract readonly type: LayerType;

  protected constructor({
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    opacity = 1,
    visible = true,
    tags,
    scale = 1,
    rotate = 0
  }: LayerOptions = {}) {
    super();
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
    this._scale = scale;
    this._rotate = rotate;
    this.opacity = opacity;
    this.visible = visible;
    this.tags = tags ? (Array.isArray(tags) ? tags : [tags]) : [];
  }

  static isTextLayer(layer: Layer): layer is TextLayer {
    return layer.type === 'text';
  }

  static isContainerLayer(layer: any): layer is ContainerLayer {
    return 'children' in layer;
  }

  static isLineLayer(layer: Layer): layer is LineLayer {
    return layer.type === 'line' || layer.type === 'arrow';
  }

  get x() {
    return this._x;
  }
  set x(v) {
    this._x = v;
  }
  get y() {
    return this._y;
  }

  set y(v) {
    this._y = v;
  }

  get width() {
    return this._width;
  }

  set width(v) {
    this._width = v;
  }

  get height() {
    return this._height;
  }

  set height(v) {
    this._height = v;
  }

  get scale() {
    return this._scale;
  }

  set scale(v) {
    this._scale = v;
  }

  get rotate() {
    return this._rotate;
  }

  set rotate(v) {
    this._rotate = v;
  }

  abstract _render(ctx: CanvasRenderingContext2D): void;

  protected renderRoutine(
    ctx: CanvasRenderingContext2D,
    renderer: (ctx: CanvasRenderingContext2D) => void,
    useAlpha: boolean
  ) {
    if (!this.visible) return;
    ctx.save();
    if (useAlpha && this.opacity < 1) {
      ctx.globalAlpha = Math.max(0, Math.min(1, this.opacity));
    }
    renderer.call(this, ctx);
    ctx.restore();
  }

  render(ctx: CanvasRenderingContext2D) {
    this.renderRoutine(ctx, this._render, this.opacity < 1);
  }

  /* pure bounds */
  getBounds(): Bounds {
    return Bound.createBounds(this.x, this.y, this.width, this.height);
  }

  /* bounds with resolve scale */
  getClientBoundRect(): Bounds {
    const bounds = this.getBounds();
    Bound.setScale(bounds, this.scale);
    let parent = this.parent;
    while (parent) {
      if (!parent.hasTag('group')) {
        Bound.setOffset(bounds, parent);
        Bound.setScale(bounds, parent.scale);
      }
      parent = parent.parent;
    }
    return bounds;
  }

  resolveParentTransform(dx: number, dy: number): { dx: number; dy: number } {
    let parent = this.parent;
    let _dx = dx;
    let _dy = dy;

    while (parent) {
      _dx /= parent.scale;
      _dy /= parent.scale;

      const radians = parent.rotate;
      const rotatedDx = _dx * Math.cos(-radians) - _dy * Math.sin(-radians);
      const rotatedDy = _dx * Math.sin(-radians) + _dy * Math.cos(-radians);
      _dx = rotatedDx;
      _dy = rotatedDy;

      parent = parent.parent;
    }

    return { dx: _dx, dy: _dy };
  }

  addTag(tag: string) {
    this.tags.push(tag);
  }

  toggleTag(tag: string) {
    const idx = this.tags.indexOf(tag);
    if (idx === -1) {
      this.tags.push(tag);
    } else {
      this.tags.splice(idx, 1);
    }
  }

  removeTag(tag: string) {
    const idx = this.tags.indexOf(tag);
    if (idx !== -1) {
      this.tags.splice(idx, 1);
    }
  }

  hasTag(tag: string) {
    return this.tags.includes(tag);
  }

  isParent(layer: ContainerLayer) {
    let parent = this.parent;
    while (parent) {
      if (parent === layer) {
        return true;
      }
      parent = parent.parent;
    }
    return false;
  }
}
