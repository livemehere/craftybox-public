import { LayerType, Rounds } from '../../types';
import InteractionLayer from '../Core/InteractionLayer';
import { LayerOptions } from '../Core/Layer';
import RectDrawer from '../../Drawer/RectDrawer';
import { DrawerOptions } from '../../Drawer';

type RectLayerOptions = LayerOptions &
  DrawerOptions & {
    rounds?: Rounds;
  };

export default class RectLayer extends InteractionLayer {
  readonly type: LayerType = 'rect';
  readonly drawer: RectDrawer;
  readonly hitDrawer: RectDrawer;

  constructor(props: RectLayerOptions) {
    super(props);
    this.drawer = new RectDrawer(props);
    this.hitDrawer = new RectDrawer({
      ...props,
      fillStyle: this.id,
      strokeStyle: this.id,
      dash: undefined,
    });
  }

  _render(ctx: CanvasRenderingContext2D) {
    this.drawer.draw(ctx, this);
  }

  _renderHitArea(ctx: CanvasRenderingContext2D) {
    this.hitDrawer.draw(ctx, this);
  }
}
