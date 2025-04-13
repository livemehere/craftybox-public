import InteractionLayer from '../Core/InteractionLayer';
import { LayerOptions } from '../Core/Layer';
import ImageDrawer, { ImageDrawerOptions } from '../../Drawer/ImageDrawer';
import RectDrawer from '../../Drawer/RectDrawer';
import { LayerType } from '../../types';

type ImageLayerOptions = LayerOptions &
  ImageDrawerOptions & {
    src: string;
  };

export default class ImageLayer extends InteractionLayer {
  readonly type: LayerType = 'image';
  private static cache: Record<string, HTMLImageElement> = {};

  drawer: ImageDrawer;
  hitDrawer: RectDrawer;

  private _src: string;
  _image: HTMLImageElement | null = null;

  static load = (src: string) => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'Anonymous';
      image.onload = () => {
        ImageLayer.cache[src] = image;
        resolve(image);
      };
      image.onerror = () => {
        reject();
      };
      image.src = src;
    });
  };

  loadImage() {
    this._image = null;
    if (ImageLayer.cache[this._src]) {
      this._image = ImageLayer.cache[this._src];
    } else {
      this._image = null;
      ImageLayer.load(this._src)
        .then((img) => {
          this._image = img;
          this.dispatch('redraw');
        })
        .catch(() => {
          this.dispatch(
            'error',
            new Error(`[ImageLayer] Failed to load image src : ${this._src}`)
          );
        });
    }
  }

  constructor(props: ImageLayerOptions) {
    super(props);
    this.drawer = new ImageDrawer(props);
    this.hitDrawer = new RectDrawer({
      ...props,
      fillStyle: this.id,
      strokeStyle: this.id,
      dash: undefined,
    });
    this._src = props.src;
    this.loadImage();
  }

  get src(): string {
    return this._src;
  }

  set src(v: string) {
    this._src = v;
    this.loadImage();
  }

  override get width() {
    return this._width || this._image?.width || 0;
  }
  override get height() {
    return this._height || this._image?.height || 0;
  }

  _render(ctx: CanvasRenderingContext2D): void {
    this.drawer.draw(ctx, this);
  }

  _renderHitArea(ctx: CanvasRenderingContext2D): void {
    this.hitDrawer.draw(ctx, this);
  }
}
