import InteractionLayer from '../Core/InteractionLayer';
import { LayerOptions } from '../Core/Layer';
import PolygonDrawer, { PolygonDrawerOptions } from '../../Drawer/PolygonDrawer';
import { LayerType } from '../../types';

type PolygonLayerOptions = LayerOptions & PolygonDrawerOptions;

export default class PolygonLayer extends InteractionLayer {
  readonly type: LayerType = 'polygon';
  readonly drawer: PolygonDrawer;
  readonly hitDrawer: PolygonDrawer;

  constructor(props: PolygonLayerOptions) {
    super(props);
    this.drawer = new PolygonDrawer(props);
    this.hitDrawer = new PolygonDrawer({ ...props, strokeStyle: this.id, fillStyle: this.id, dash: undefined });
  }

  _render(ctx: CanvasRenderingContext2D): void {
    this.drawer.draw(ctx, this);
  }

  _renderHitArea(ctx: CanvasRenderingContext2D): void {
    this.hitDrawer.draw(ctx, this);
  }
}
