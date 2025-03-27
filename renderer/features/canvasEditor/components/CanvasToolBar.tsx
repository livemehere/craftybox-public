import { LuMousePointer2 } from 'react-icons/lu';
import { PiRectangleLight } from 'react-icons/pi';
import { PiCircleLight } from 'react-icons/pi';
import { PiArrowRightLight } from 'react-icons/pi';
import { PiLinkLight } from 'react-icons/pi';
import { useAtom } from 'jotai';
import { useAtomValue } from 'jotai';
import { useEffect, useRef, useCallback } from 'react';
import Konva from 'konva';
import { Vector2d } from 'konva/lib/types';
import { Shape } from 'konva/lib/Shape';
import { useHotkeys } from 'react-hotkeys-hook';

import { selectedCanvasToolAtom } from '../store/selectedCanvasToolAtom';
import { stageAtom } from '../store/stageAtom';

import { cn } from '@/utils/cn';

/**
 * Available canvas tools configuration
 */
const tools = {
  pointer: {
    id: 'pointer',
    icon: LuMousePointer2
  },
  rectangle: {
    id: 'rectangle',
    icon: PiRectangleLight
  },
  ellipse: {
    id: 'ellipse',
    icon: PiCircleLight
  },
  arrow: {
    id: 'arrow',
    icon: PiArrowRightLight
  },
  line: {
    id: 'line',
    icon: PiLinkLight
  }
} as const;

export type TCanvasTool = keyof typeof tools;

export default function CanvasToolBar() {
  const [selectedTool, setSelectedTool] = useAtom(selectedCanvasToolAtom);
  const stage = useAtomValue(stageAtom);
  const trRef = useRef<Konva.Transformer | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const shapeRef = useRef<Shape | null>(null);
  const startPosRef = useRef<Vector2d | null>(null);

  /**
   * Clear the transformer and deselect all shapes
   */
  const clearTransformer = useCallback(() => {
    const tr = trRef.current;
    if (!tr) return;
    tr.nodes([]);
  }, []);

  /**
   * Apply transformer to the target node
   */
  const applyTransformerToNode = useCallback((target: Konva.Node) => {
    const tr = trRef.current;
    if (!tr) return;

    tr.nodes([target]);
    target.draggable(true);
    tr.moveToTop();
    tr.forceUpdate();
  }, []);

  /**
   * Set draggable property on all shapes in the layer
   */
  const setAllShapesDraggable = useCallback(
    (draggable: boolean) => {
      if (!stage) return;

      const layer = stage.getLayers()[0];
      if (!layer) return;

      const shapes = layer.getChildren().filter((child) => child.hasName('shape'));
      for (const shape of shapes) {
        shape.draggable(draggable);
      }
    },
    [stage]
  );

  /**
   * Handle creating a new shape based on selected tool
   */
  const createShape = useCallback(
    (pos: Vector2d, tool: TCanvasTool) => {
      if (!stage) return null;

      let newShape: Shape | null = null;

      switch (tool) {
        case 'rectangle':
          newShape = new Konva.Rect({
            x: pos.x,
            y: pos.y,
            width: 0,
            height: 0,
            fill: '#fff',
            stroke: '#000',
            strokeWidth: 2
          });
          break;
        case 'ellipse':
          newShape = new Konva.Ellipse({
            x: pos.x,
            y: pos.y,
            radiusX: 0,
            radiusY: 0,
            fill: '#fff',
            stroke: '#000',
            strokeWidth: 2
          });
          break;
        case 'arrow':
          newShape = new Konva.Arrow({
            x: 0,
            y: 0,
            points: [pos.x, pos.y],
            fill: '#fff',
            stroke: '#000',
            strokeWidth: 2
          });
          break;
        case 'line':
          newShape = new Konva.Line({
            x: 0,
            y: 0,
            points: [pos.x, pos.y],
            stroke: '#000',
            strokeWidth: 2
          });
          break;
        default:
          break;
      }

      return newShape;
    },
    [stage]
  );

  /**
   * Update shape dimensions while drawing
   */
  const updateShapeOnDrag = useCallback((shape: Shape, startPos: Vector2d, currentPos: Vector2d, tool: TCanvasTool) => {
    const width = currentPos.x - startPos.x;
    const height = currentPos.y - startPos.y;

    switch (tool) {
      case 'rectangle':
        (shape as Konva.Rect).width(width);
        (shape as Konva.Rect).height(height);
        break;
      case 'ellipse':
        (shape as Konva.Ellipse).radiusX(Math.abs(width) / 2);
        (shape as Konva.Ellipse).radiusY(Math.abs(height) / 2);
        (shape as Konva.Ellipse).x(startPos.x + width / 2);
        (shape as Konva.Ellipse).y(startPos.y + height / 2);
        break;
      case 'arrow':
      case 'line':
        (shape as Konva.Arrow | Konva.Line).points([startPos.x, startPos.y, currentPos.x, currentPos.y]);
        break;
    }
  }, []);

  /**
   * Finish drawing and select the created shape
   */
  const finishDrawing = useCallback(() => {
    isDrawingRef.current = false;
    const shape = shapeRef.current;

    if (shape) {
      applyTransformerToNode(shape);
      setSelectedTool('pointer');
      setAllShapesDraggable(true);
    }

    shapeRef.current = null;
    startPosRef.current = null;
  }, [applyTransformerToNode, setAllShapesDraggable, setSelectedTool]);

  /**
   * Handle pointer down event for drawing shapes
   */
  const handlePointerDown = useCallback(() => {
    if (!stage || selectedTool === 'pointer') return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    clearTransformer();
    setAllShapesDraggable(false);

    startPosRef.current = pos;
    const newShape = createShape(pos, selectedTool);

    if (newShape) {
      const layer = stage.getLayers()[0];
      newShape.addName('shape');
      layer.add(newShape);
      newShape.moveToTop();

      shapeRef.current = newShape;
      isDrawingRef.current = true;
    }
  }, [stage, selectedTool, clearTransformer, setAllShapesDraggable, createShape]);

  /**
   * Handle pointer move event for updating shape dimensions
   */
  const handlePointerMove = useCallback(() => {
    if (!stage || !isDrawingRef.current || !shapeRef.current || !startPosRef.current) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    updateShapeOnDrag(shapeRef.current, startPosRef.current, pos, selectedTool);
  }, [stage, selectedTool, updateShapeOnDrag]);

  /**
   * Handle stage click to select or deselect shapes
   */
  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const target = e.target;

      if (target === stage) {
        clearTransformer();
        setAllShapesDraggable(true);
      } else if (!target.hasName('_anchor')) {
        setAllShapesDraggable(false);
        applyTransformerToNode(target);
      }
    },
    [stage, clearTransformer, setAllShapesDraggable, applyTransformerToNode]
  );

  // Initialize transformer
  useEffect(() => {
    if (!stage) return;

    const layer = stage.getLayers()[0];
    const tr = new Konva.Transformer();
    layer.add(tr);
    trRef.current = tr;

    stage.on('click', handleStageClick);

    return () => {
      stage.off('click', handleStageClick);
    };
  }, [stage, handleStageClick]);

  // Setup drawing event handlers
  useEffect(() => {
    if (!stage) return;

    if (selectedTool !== 'pointer') {
      stage.on('pointerdown', handlePointerDown);
      stage.on('pointermove', handlePointerMove);
      stage.on('pointerup', finishDrawing);
    }

    return () => {
      stage.off('pointerdown', handlePointerDown);
      stage.off('pointermove', handlePointerMove);
      stage.off('pointerup', finishDrawing);
    };
  }, [stage, selectedTool, handlePointerDown, handlePointerMove, finishDrawing]);

  // Set up keyboard shortcuts
  useHotkeys('v', () => setSelectedTool('pointer'));
  useHotkeys('r', () => setSelectedTool('rectangle'));
  useHotkeys('e', () => setSelectedTool('ellipse'));
  useHotkeys('a', () => setSelectedTool('arrow'));
  useHotkeys('l', () => setSelectedTool('line'));

  return (
    <div className='absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center gap-2'>
      <div className='flex items-center justify-center gap-2 rounded bg-neutral-700 p-2'>
        {Object.entries(tools).map(([key, tool]) => (
          <button
            key={key}
            className={cn('flex items-center justify-center rounded p-2', selectedTool === key && 'bg-blue-500')}
            onClick={() => setSelectedTool(tool.id)}
          >
            <tool.icon />
          </button>
        ))}
      </div>
    </div>
  );
}
