import InteractionLayer from '../Core/InteractionLayer';
import { LayerOptions } from '../Core/Layer';
import TextDrawer, { TextDrawerOptions } from '../../Drawer/TextDrawer';
import RectDrawer from '../../Drawer/RectDrawer';

type TextLayerOptions = Omit<LayerOptions, 'width' | 'height'> &
  TextDrawerOptions & {
    maxWidth?: number;
    maxLines?: number;
    text: string;
    align?: 'left' | 'right' | 'center';
    baseLine?: CanvasTextBaseline;
    spacing?: number;
    /** @description Line height multiplier 1 = 100% */
    lineHeight?: number;
    fontSize?: number;
    fontWeight?: string | number;
    fontFamily?: string;
    truncate?: boolean;
  };

export default class TextLayer extends InteractionLayer {
  readonly type = 'text';
  readonly drawer: TextDrawer;
  readonly hitDrawer: RectDrawer;

  private cacheText?: string;

  maxWidth?: number;
  maxLines?: number;
  text: string;
  align: CanvasTextAlign;
  baseLine: CanvasTextBaseline;
  lineHeight: number;
  spacing: number;
  fontSize: number;
  fontWeight: string | number;
  fontFamily: string;
  truncate: boolean;

  _lines: string[] = [];

  constructor(props: TextLayerOptions) {
    super(props);
    this.drawer = new TextDrawer(props);
    this.hitDrawer = new RectDrawer({
      ...props,
      fillStyle: this.id,
      strokeStyle: this.id,
      dash: undefined,
    });
    this.maxWidth = props.maxWidth;
    this.maxLines = props.maxLines;
    this.text = props.text;
    this.align = props.align || 'left';
    this.baseLine = props.baseLine || 'top';
    this.lineHeight = props.lineHeight || 1;
    this.spacing = props.spacing || 0;
    this.fontSize = props.fontSize || 16;
    this.fontWeight = props.fontWeight || 400;
    this.fontFamily = props.fontFamily || 'Arial';
    this.truncate = props.truncate || true;
    this._lines = this.text.split('\n');
  }

  private updateLines(ctx: CanvasRenderingContext2D) {
    if (this.text === '') {
      return (this._lines = ['']);
    }
    const truncate = '...';
    const truncateWidth = ctx.measureText(truncate).width;

    let leftLines = this.maxLines ?? Infinity;
    const _lines = [];
    let curW = 0;
    let curL = '';
    for (let i = 0; i < this.text.length; i++) {
      if (leftLines === 0) {
        break;
      }

      const char = this.text[i];
      const nextW = curW + ctx.measureText(char).width;
      const isOverflow = this.maxWidth
        ? leftLines === 1 && this.truncate
          ? nextW >= this.maxWidth - truncateWidth
          : nextW >= this.maxWidth
        : false;

      if (char === '\n' || isOverflow) {
        if (this.truncate && leftLines === 1) {
          curL += truncate;
        }
        _lines.push(curL);
        curL = char === '\n' ? '' : char;
        curW = 0;

        leftLines--;
        continue;
      }
      curL += char;
      curW = nextW;
    }
    if (curL && leftLines > 0) {
      _lines.push(curL);
    }
    this._lines = _lines;
  }

  private setupText(ctx: CanvasRenderingContext2D) {
    ctx.font = `${this.fontWeight} ${this.fontSize}px ${this.fontFamily}`;
    ctx.letterSpacing = `${this.spacing}px`;
    ctx.textBaseline = this.baseLine;
  }

  private measureWidth(ctx: CanvasRenderingContext2D) {
    return this._lines.reduce((max, line) => {
      const width = ctx.measureText(line).width;
      return Math.max(max, width);
    }, 0);
  }

  private measureHeight() {
    return this._lines.length * this.fontSize * this.lineHeight;
  }

  _measureAndUpdateSize(ctx: CanvasRenderingContext2D) {
    this.setupText(ctx);
    if (this.text !== this.cacheText) {
      this.updateLines(ctx);
      this.width =
        this.align === 'right' && this.maxWidth
          ? this.maxWidth
          : this.maxWidth
            ? Math.min(this.maxWidth, this.measureWidth(ctx))
            : this.measureWidth(ctx);
      this.height = this.measureHeight();
      this.cacheText = this.text;
    }
  }

  _render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    this._measureAndUpdateSize(ctx);
    this.drawer.draw(ctx, this);
    ctx.restore();
  }

  _renderHitArea(ctx: CanvasRenderingContext2D) {
    ctx.save();
    this.setupText(ctx);
    this.hitDrawer.draw(ctx, this);
    ctx.restore();
  }
}
