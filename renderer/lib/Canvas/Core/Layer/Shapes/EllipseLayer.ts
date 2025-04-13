import InteractionLayer from '../Core/InteractionLayer';
import { LayerOptions } from '../Core/Layer';
import EllipseDrawer, {
  EllipseDrawerOptions,
} from '../../Drawer/EllipseDrawer';
import { LayerType } from '../../types';

type EllipseLayerOptions = LayerOptions & EllipseDrawerOptions;

export class EllipseLayer extends InteractionLayer {
  readonly type: LayerType = 'ellipse';
  readonly drawer: EllipseDrawer;
  readonly hitDrawer: EllipseDrawer;

  constructor(props: EllipseLayerOptions) {
    super(props);
    this.drawer = new EllipseDrawer(props);
    this.hitDrawer = new EllipseDrawer({
      ...props,
      fillStyle: this.id,
      strokeStyle: this.id,
      dash: undefined,
    });
  }

  _render(ctx: CanvasRenderingContext2D): void {
    this.drawer.draw(ctx, this);
  }

  _renderHitArea(ctx: CanvasRenderingContext2D): void {
    this.hitDrawer.draw(ctx, this);
  }
}
