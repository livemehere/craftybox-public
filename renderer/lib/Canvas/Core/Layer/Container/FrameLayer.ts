import { LayerOptions } from '../Core/Layer';
import RectDrawer, { RectDrawerOptions } from '../../Drawer/RectDrawer';

import ContainerLayer from './ContainerLayer';

// TODO: add clip options (when children is out of frame)

type FrameLayerOptions = LayerOptions &
  RectDrawerOptions & {
    width: number;
    height: number;
    clipContent?: boolean;
  };

export default class FrameLayer extends ContainerLayer {
  readonly type = 'frame';
  readonly drawer: RectDrawer;
  readonly hitDrawer: RectDrawer;
  clipContent: boolean;

  constructor(props: FrameLayerOptions) {
    super(props);
    this.clipContent = props.clipContent ?? true;
    this.drawer = new RectDrawer(props);
    this.hitDrawer = new RectDrawer({
      fillStyle: this.id
    });
  }

  _render(ctx: CanvasRenderingContext2D) {
    this.drawer.draw(
      ctx,
      this,
      () => {
        this.children.forEach((c) => c.render(ctx));
      },
      {
        clipChildren: this.clipContent
      }
    );
  }

  _renderHitArea(ctx: CanvasRenderingContext2D) {
    this.hitDrawer.draw(
      ctx,
      this,
      () => {
        this.children.forEach((c) => c.renderHitArea(ctx));
      },
      {
        clipChildren: this.clipContent
      }
    );
  }
}
