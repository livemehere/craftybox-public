export interface Point {
  x: number;
  y: number;
}

export type Box = {
  width: number;
  height: number;
};

export type Rounds = {
  lt?: number;
  rt?: number;
  rb?: number;
  lb?: number;
};

export type FillStyle = string | CanvasGradient | CanvasPattern;

export type LayerType = 'group' | 'frame' | 'rect' | 'line' | 'ellipse' | 'polygon' | 'text' | 'image' | 'arrow';

export type CursorType =
  | 'default'
  | 'pointer'
  | 'text'
  | 'wait'
  | 'help'
  | 'move'
  | 'not-allowed'
  | 'crosshair'
  | 'progress'
  | 'cell'
  | 'context-menu'
  | 'alias'
  | 'copy'
  | 'no-drop'
  | 'grab'
  | 'grabbing'
  | 'zoom-in'
  | 'zoom-out'
  | 'n-resize'
  | 'e-resize'
  | 's-resize'
  | 'w-resize'
  | 'ne-resize'
  | 'nw-resize'
  | 'se-resize'
  | 'sw-resize'
  | 'col-resize'
  | 'row-resize'
  | 'all-scroll'
  | 'none'
  | 'url'; // Custom cursor via a URL.
