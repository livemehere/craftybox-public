import { Emitter } from '@fewings/core/classes';

import { FillStyle, Point } from './types';
import InteractionLayer from './Layer/Core/InteractionLayer';
import { TLayerEvents } from './Layer/Core/Layer';
import FrameLayer from './Layer/Container/FrameLayer';
import TextLayer from './Layer/Shapes/TextLayer';

type TExportOptions = {
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

interface StageOptions {
  canvas: HTMLCanvasElement;
  backgroundColor?: FillStyle;
  pixelRatio?: number;
  transparent?: boolean;
  debugHitArea?: boolean;
  interactable?: boolean;
}

type TStageEventPayload = {
  target?: InteractionLayer;
  pointerX: number;
  pointerY: number;
  startX: number | null;
  startY: number | null;
};

type TStageEvents = {
  pointerdown: (e: TStageEventPayload) => void;
  pointerup: (e: TStageEventPayload) => void;
  pointermove: (e: TStageEventPayload) => void;
};

export default class Stage extends Emitter<TStageEvents> {
  private static idSeq = 0;

  private id: number;
  private readonly renderCanvas: HTMLCanvasElement;
  private readonly renderCtx: CanvasRenderingContext2D;

  protected readonly hitCanvas?: HTMLCanvasElement;
  protected readonly hitCtx?: CanvasRenderingContext2D;

  private readonly pixelRatio: number;
  private backgroundColor?: FillStyle;

  private readonly interactable?: boolean;

  width = 0; // logical size
  height = 0; // logical size
  private appWidth; // physical size
  private appHeight; // physical size

  private rootLayer!: FrameLayer;
  private curHoverLayer: InteractionLayer | null = null;
  private startPos: Point | null = null;

  private loopId: number | null = null;
  private loopCallbacks: ((stage: Stage) => void)[] = [];

  constructor({
    canvas,
    transparent = false,
    backgroundColor,
    pixelRatio = 1,
    debugHitArea = false,
    interactable = true
  }: StageOptions) {
    super();
    this.id = Stage.idSeq++;
    this.interactable = interactable;
    this.pixelRatio = pixelRatio;
    this.backgroundColor = backgroundColor;

    this.renderCanvas = canvas;
    this.renderCtx = this.renderCanvas.getContext('2d', { alpha: transparent, willReadFrequently: false })!;

    this.width = this.renderCanvas.offsetWidth;
    this.height = this.renderCanvas.offsetHeight;
    this.appWidth = this.width * this.pixelRatio;
    this.appHeight = this.height * this.pixelRatio;
    this.renderCanvas.width = this.appWidth;
    this.renderCanvas.height = this.appHeight;

    if (this.interactable) {
      this.hitCanvas = document.createElement('canvas');
      this.hitCanvas.id = `hit-canvas-${this.id}`;
      this.hitCtx = this.hitCanvas.getContext('2d', { alpha: false, willReadFrequently: true })!;
      this.hitCtx.imageSmoothingEnabled = false;
      this.hitCanvas.width = this.width;
      this.hitCanvas.height = this.height;
    }

    this.createRootLayer();

    if (this.isInteractable()) {
      this.registerPointerEvents();
      if (debugHitArea) {
        this.displayDebugHitArea();
      }
    }
  }

  private createRootLayer() {
    this.rootLayer = new FrameLayer({
      tags: ['root'],
      width: this.width,
      height: this.height,
      clipContent: false
    });
    this.rootLayer.on('redraw', this.render.bind(this));
    this.rootLayer.on('error', (e) => {
      console.error(e);
    });
  }

  isInteractable(): this is Stage & { hitCanvas: HTMLCanvasElement; hitCtx: CanvasRenderingContext2D } {
    return this.interactable === true && this.hitCanvas !== undefined && this.hitCtx !== undefined;
  }

  get root() {
    return this.rootLayer;
  }

  private displayDebugHitArea() {
    if (!this.isInteractable()) return;
    this.hitCanvas.style.cssText = `
        position: fixed;
        right:0;
        bottom:0;
        width:300px;
        z-index: 9999;
      `;
    InteractionLayer.seqStep = 100;
    if (document.querySelector(`#${this.hitCanvas.id}`)) return;
    document.body.append(this.hitCanvas);
  }

  registerPointerEvents() {
    this.renderCanvas.addEventListener('pointerdown', this.onPointerDown.bind(this));
    this.renderCanvas.addEventListener('pointermove', this.onPointerMove.bind(this));
    this.renderCanvas.addEventListener('pointerup', this.onPointerUp.bind(this));
  }

  render() {
    this.renderCtx.save();
    this.renderCtx.scale(this.pixelRatio, this.pixelRatio);
    if (this.backgroundColor) {
      this.renderCtx.fillStyle = this.backgroundColor;
      this.renderCtx.fillRect(0, 0, this.width, this.height);
    } else {
      this.renderCtx.clearRect(0, 0, this.width, this.height);
    }

    this.rootLayer.render(this.renderCtx);
    this.renderCtx.restore();

    if (this.isInteractable()) {
      this.hitCtx.save();
      this.hitCtx.clearRect(0, 0, this.width, this.height);
      this.rootLayer.renderHitArea(this.hitCtx);
      this.hitCtx.restore();
    }
  }

  private onPointerDown(e: PointerEvent) {
    const rect = this.renderCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const color = this.getColorAt(x, y);
    const targetLayer = InteractionLayer.getLayerById(color);

    this.startPos = { x, y };

    if (targetLayer) {
      this.dispatchLayerEvent(targetLayer, 'pointerdown', x, y);
    }
    this.dispatchStageEvent(targetLayer, 'pointerdown', x, y);
  }

  private onPointerMove(e: PointerEvent) {
    const rect = this.renderCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const color = this.getColorAt(x, y);
    const targetLayer = InteractionLayer.getLayerById(color);

    if (targetLayer) {
      this.dispatchLayerEvent(targetLayer, 'pointermove', x, y);

      if (this.curHoverLayer !== targetLayer) {
        if (this.curHoverLayer) {
          this.dispatchLayerEvent(this.curHoverLayer, 'pointerleave', x, y);
        }
        this.dispatchLayerEvent(targetLayer, 'pointerenter', x, y);
        this.curHoverLayer = targetLayer;
      }
    }

    this.dispatchStageEvent(targetLayer, 'pointermove', x, y);
  }

  private onPointerUp(e: PointerEvent) {
    const rect = this.renderCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const color = this.getColorAt(x, y);
    const targetLayer = InteractionLayer.getLayerById(color);
    this.startPos = null;
    if (targetLayer) {
      this.dispatchLayerEvent(targetLayer, 'pointerup', x, y);
    }
    this.dispatchStageEvent(targetLayer, 'pointerup', x, y);
  }

  private getColorAt(x: number, y: number) {
    const rgba = this.hitCtx!.getImageData(x, y, 1, 1).data;
    const int = 0xf000000 | (rgba[0] << 16) | (rgba[1] << 8) | rgba[2];
    return int.toString(16).replace(/^f/, '#');
  }

  private dispatchLayerEvent(layer: InteractionLayer, type: keyof TLayerEvents, x: number, y: number) {
    layer.dispatch(type, {
      target: layer,
      currentTarget: layer,
      pointerX: x,
      pointerY: y,
      startX: this.startPos?.x ?? null,
      startY: this.startPos?.y ?? null,
      stopPropagation: () => {
        throw new Error('not implemented');
      }
    });
  }

  private dispatchStageEvent(layer: InteractionLayer | undefined, type: keyof TStageEvents, x: number, y: number) {
    this.dispatch(type, {
      target: layer,
      pointerX: x,
      pointerY: y,
      startX: this.startPos?.x ?? null,
      startY: this.startPos?.y ?? null
    });
  }

  startLoop() {
    this.loopId = requestAnimationFrame(this.startLoop.bind(this));
    this.loopCallbacks.forEach((cb) => cb(this));
    this.render();
  }

  stopLoop() {
    if (this.loopId !== null) {
      cancelAnimationFrame(this.loopId);
      this.loopId = null;
    }
  }

  addLoop(callback: (stage: Stage) => void) {
    this.loopCallbacks.push(callback);
    return () => {
      this.loopCallbacks = this.loopCallbacks.filter((cb) => cb !== callback);
    };
  }

  removeAllLoops() {
    this.loopCallbacks = [];
  }

  /**
   * TextLayer width & height auto sized when they are render.
   * If you need to update the size before render, call this method.
   */
  measureAndUpdateTextLayer(layer: TextLayer) {
    layer._measureAndUpdateSize(this.renderCtx);
  }

  async toBlob(options?: TExportOptions) {
    const crop = options?.crop;
    if (crop) {
      const img = new Image();
      const dataUrl = this.renderCanvas.toDataURL('image/png', 1);
      img.src = dataUrl;
      await new Promise((resolve) => {
        img.onload = () => {
          resolve(null);
        };
      });
      const cropCanvas = document.createElement('canvas');
      const cropCtx = cropCanvas.getContext('2d')!;
      cropCanvas.width = crop.width;
      cropCanvas.height = crop.height;
      cropCtx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
      return new Promise<Blob>((resolve) => {
        cropCanvas.toBlob((blob) => {
          resolve(blob!);
          URL.revokeObjectURL(dataUrl);
          cropCanvas.remove();
        });
      });
    }

    return new Promise<Blob>((resolve) => {
      this.renderCanvas.toBlob((blob) => {
        resolve(blob!);
      });
    });
  }

  async toDataUrl(options?: TExportOptions) {
    const blob = await this.toBlob(options);
    return URL.createObjectURL(blob);
  }

  async copyToClipboard(options?: TExportOptions) {
    const blob = await this.toBlob(options);
    const item = new ClipboardItem({
      'image/png': blob
    });
    await navigator.clipboard.write([item]);
  }

  async toBase64(options?: TExportOptions) {
    const blob = await this.toBlob(options);
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(blob);
    });
  }

  destroy() {
    this.stopLoop();
    this.backgroundColor = undefined;
    this.renderCtx.clearRect(0, 0, this.appWidth, this.appHeight);
    this.removeAllLoops();
    this.removeAllListeners();
    if (this.isInteractable()) {
      this.renderCanvas.removeEventListener('pointerdown', this.onPointerDown.bind(this));
      this.renderCanvas.removeEventListener('pointermove', this.onPointerMove.bind(this));
      this.renderCanvas.removeEventListener('pointerup', this.onPointerUp.bind(this));
      this.hitCanvas!.remove();
    }
    this.curHoverLayer = null;
    this.startPos = null;
  }
}
