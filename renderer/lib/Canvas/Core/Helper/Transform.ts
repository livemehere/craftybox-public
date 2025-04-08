import Stage from '../Stage';
import InteractionLayer from '../Layer/Core/InteractionLayer';
import Layer from '../Layer/Core/Layer';
import TextLayer from '../Layer/Shapes/TextLayer';
import { CursorType } from '../types';

/**
 * Transformer class provides utility methods to transform the dimensions
 * and position of a Layer instance. Unlike abstract transformations,
 * this class directly modifies the actual x, y coordinates and the
 * width and height of the layer.
 */
export default class Transform {
  private static draggables: InteractionLayer[] = [];
  static degToRad(deg: number) {
    return deg * (Math.PI / 180);
  }
  static radToDeg(rad: number) {
    return rad * (180 / Math.PI);
  }

  static checkInteractable(stage: Stage) {
    if (!stage.isInteractable()) {
      throw new Error('Stage is not interactable');
    }
  }

  static isDraggable(layer: InteractionLayer) {
    return Transform.draggables.includes(layer);
  }

  private static addDraggable(layer: InteractionLayer) {
    const idx = Transform.draggables.indexOf(layer);
    if (idx !== -1) {
      return;
    }
    Transform.draggables.push(layer);
  }

  private static removeDraggable(layer: InteractionLayer) {
    Transform.draggables = Transform.draggables.filter((l) => l !== layer);
  }

  /**
   * Make a layer draggable. This method will add event listeners to stage root instance.
   * @return {Function} A function to remove the event listeners.
   */
  static draggable(
    stage: Stage,
    layer: InteractionLayer,
    options?: {
      onDragStart?: () => void;
      onDragEnd?: () => void;
      onDrag?: () => void;
      padding?: number;
    }
  ) {
    Transform.checkInteractable(stage);
    Transform.addDraggable(layer);
    let target: InteractionLayer | undefined;
    let prevPos = {
      x: 0,
      y: 0,
    };
    let startFlag = false;
    const offDownHandler = stage.on('pointerdown', (e) => {
      if (
        layer.hasTag('root') &&
        (e.target === undefined || e.target === layer)
      ) {
        target = layer; // stage.root
        prevPos = {
          x: target.x,
          y: target.y,
        };
        stage.render();
        return;
      }

      if (layer === e.target) {
        target = e.target;
        prevPos = {
          x: target.x,
          y: target.y,
        };
        return;
      }

      if (
        Layer.isContainerLayer(layer) &&
        e.target?.isParent(layer) &&
        !Transform.isDraggable(e.target)
      ) {
        target = layer;
        prevPos = {
          x: target.x,
          y: target.y,
        };
        return;
      }
    });

    const offMoveHandler = stage.on('pointermove', (e) => {
      if (target && e.startX && e.startY) {
        const dx = e.pointerX - e.startX;
        const dy = e.pointerY - e.startY;

        const { dx: adjustedDx, dy: adjustedDy } =
          target.resolveParentTransform(dx, dy);
        target.x = prevPos.x + adjustedDx;
        target.y = prevPos.y + adjustedDy;

        stage.render();
        options?.onDrag?.();
        if (!startFlag) {
          options?.onDragStart?.();
          startFlag = true;
        }
      }
    });

    const offUpHandler = stage.on('pointerup', () => {
      if (target) {
        target = undefined;
        startFlag = false;
        options?.onDragEnd?.();
      }
      stage.render();
    });

    return () => {
      offDownHandler();
      offMoveHandler();
      offUpHandler();
      Transform.removeDraggable(layer);
    };
  }

  static scalable(
    stage: Stage,
    layer: InteractionLayer,
    options?: { onScale?: () => void; factor?: number }
  ) {
    Transform.checkInteractable(stage);
    const handler = (e: WheelEvent) => {
      const isUp = e.deltaY < 0;
      const factor = options?.factor ?? 0.1;
      layer.scale += isUp ? factor : -factor;
      stage.render();
    };

    window.addEventListener('wheel', handler);

    return () => {
      window.removeEventListener('wheel', handler);
    };
  }

  static textEditable(
    stage: Stage,
    layer: TextLayer,
    options?: {
      onFocus?: () => void;
      onBlur?: () => void;
    }
  ) {
    layer.drawer.showCursor = true;
    const textArea = document.createElement('textarea');
    textArea.style.cssText = `
        position:fixed;
        top:-999999px;
        right:-999999px;
        // top:0px;
        // left:0px;
      `;

    const tempBlur = () => {
      textArea.blur();
      options?.onBlur?.();
    };

    const handleFocus = () => {
      requestAnimationFrame(() => textArea.focus());
      options?.onFocus?.();
    };

    textArea.oninput = () => {
      layer.text = textArea.value;
      stage.render();
    };

    textArea.onkeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (e.shiftKey || e.ctrlKey || e.metaKey) {
          layer.text += '\n';
        } else {
          tempBlur();
        }
      }
      stage.render();
    };

    textArea.value = layer.text;
    document.body.appendChild(textArea);

    handleFocus();

    const off = stage.on('pointerdown', (e) => {
      if (e.target !== layer) {
        tempBlur();
      } else {
        handleFocus();
      }
    });

    stage.startLoop();

    return () => {
      off();
      textArea.remove();
      layer.drawer.showCursor = false;
      stage.stopLoop();
    };
  }

  static setCursor(
    stage: Stage,
    layer: InteractionLayer,
    options: {
      onDown?: CursorType;
      onHover?: CursorType;
      onUp?: CursorType;
    }
  ) {
    Transform.checkInteractable(stage);

    const offDownHandler = layer.on('pointerdown', () => {
      if (options.onDown) {
        document.body.style.cursor = options.onDown;
      }
    });

    const offUpHandler = layer.on('pointerup', () => {
      if (options.onUp) {
        document.body.style.cursor = options.onUp;
      }
    });

    const offEnterHandler = layer.on('pointerenter', () => {
      if (options.onHover) {
        document.body.style.cursor = options.onHover;
      }
    });

    const offLeaveHandler = layer.on('pointerleave', () => {
      document.body.style.cursor = 'auto';
    });

    return () => {
      offDownHandler();
      offUpHandler();
      offEnterHandler();
      offLeaveHandler();
    };
  }
}
