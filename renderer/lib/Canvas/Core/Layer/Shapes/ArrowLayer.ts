import { LayerType } from '../../types';
import LineEdgeDrawer, { LineEdgeDrawerOptions } from '../../Drawer/LineEdgeDrawer';

import LineLayer, { LineLayerOptions } from './LineLayer';

type ArrowLayerOptions = LineLayerOptions & Partial<LineEdgeDrawerOptions>;
export default class ArrowLayer extends LineLayer {
  readonly type: LayerType = 'arrow';
  readonly lineEdgeDrawer: LineEdgeDrawer;
  readonly hitLineEdgeDrawer: LineEdgeDrawer;
  constructor(props: ArrowLayerOptions) {
    const defaultArrowSize = (props.strokeWidth ?? 2) * 3;
    super(props);
    this.lineEdgeDrawer = new LineEdgeDrawer({
      strokeWidth: 0,
      fillStyle: props.strokeStyle,
      startEdge: props.startEdge ?? false,
      endEdge: props.endEdge ?? true,
      arrowSize: props.arrowSize ?? defaultArrowSize,
      padding: props.padding ?? -defaultArrowSize / 2
    });
    this.hitLineEdgeDrawer = new LineEdgeDrawer({
      strokeWidth: 0,
      fillStyle: this.id,
      startEdge: props.startEdge ?? false,
      endEdge: props.endEdge ?? true,
      arrowSize: props.arrowSize ?? defaultArrowSize,
      padding: props.padding ?? -defaultArrowSize / 2
    });
  }

  override _render(ctx: CanvasRenderingContext2D): void {
    this.drawer.draw(ctx, this);
    this.lineEdgeDrawer.draw(ctx, this);
  }

  override _renderHitArea(ctx: CanvasRenderingContext2D): void {
    this.hitDrawer.draw(ctx, this);
    this.hitLineEdgeDrawer.draw(ctx, this);
  }
}
