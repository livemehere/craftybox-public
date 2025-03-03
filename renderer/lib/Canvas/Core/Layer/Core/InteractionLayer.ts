import { djb2 } from '@fewings/core/hash';
import { TPayLoad } from '@fewings/core/classes';

import { mapToRange } from '../../../Utils/range';
import { IDrawer } from '../../Drawer';

import Layer, { LayerOptions, TLayerEvents } from './Layer';

export interface HitAreaRenderer {
  _renderHitArea(ctx: CanvasRenderingContext2D): void;
}

export default abstract class InteractionLayer extends Layer implements HitAreaRenderer, IDrawer {
  private static idMap = new Map<string, InteractionLayer>();
  private static seq = 0;
  static seqStep = 1;
  static getLayerById = (id: string) => InteractionLayer.idMap.get(id);
  static removeLayerById = (id: string) => InteractionLayer.idMap.delete(id);

  abstract drawer: IDrawer['drawer'];
  abstract hitDrawer: IDrawer['hitDrawer'];

  readonly id: string;

  protected constructor(props: LayerOptions) {
    super(props);
    InteractionLayer.seq += InteractionLayer.seqStep;
    this.id = (0xf000000 | mapToRange(djb2(`${InteractionLayer.seq}`), 0, 0xffffff)).toString(16).replace(/^f/, '#');
    InteractionLayer.idMap.set(this.id, this);
  }

  abstract _renderHitArea(ctx: CanvasRenderingContext2D): void;

  renderHitArea(ctx: CanvasRenderingContext2D) {
    this.renderRoutine(ctx, this._renderHitArea, false);
  }

  override dispatch<E extends keyof TLayerEvents>(event: E, payload?: TPayLoad<TLayerEvents, E>) {
    let stop = false;
    if (payload && !(payload instanceof Error)) {
      payload.stopPropagation = () => (stop = true);
    }
    super.dispatch(event, payload);
    if (stop) return;
    if (payload && !(payload instanceof Error)) {
      payload.currentTarget = this.parent ?? this;
    }
    this.parent?.dispatch(event, payload);
  }

  bringToFront() {
    if (this.parent) {
      this.parent.addChild(this);
    }
  }

  bringToBack() {
    if (this.parent) {
      const idx = this.parent.children.indexOf(this);
      this.parent.children.splice(idx, 1);
      this.parent.children.unshift(this);
    }
  }

  destroy() {
    this.removeAllListeners();
    if (this.parent) {
      this.parent.removeChild(this);
    }
  }
}
