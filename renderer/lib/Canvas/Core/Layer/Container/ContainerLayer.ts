import InteractionLayer from '../Core/InteractionLayer';
import { LayerOptions } from '../Core/Layer';
import { RectDrawerOptions } from '../../Drawer/RectDrawer';

export type ContainerLayerOptions = LayerOptions & RectDrawerOptions;

export default abstract class ContainerLayer extends InteractionLayer {
  children: InteractionLayer[] = [];

  protected constructor(props: ContainerLayerOptions) {
    super(props);
  }

  addChild(layer: InteractionLayer | InteractionLayer[]) {
    const targets = Array.isArray(layer) ? layer : [layer];
    targets.forEach((l) => this._add(l));
  }

  private _add(layer: InteractionLayer) {
    const exist = this.children.find((l) => l === layer);
    if (exist) {
      this.removeChild(layer); // this for bring to front if already exist
    }
    layer.parent = this;
    this.children.push(layer);
  }

  removeChild(layer: InteractionLayer) {
    this.children = this.children.filter((l) => l !== layer);
  }

  removeAllChildren() {
    this.children = [];
  }
}
