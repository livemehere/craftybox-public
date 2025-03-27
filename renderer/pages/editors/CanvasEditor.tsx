import { Rect, Transformer, Arrow, Line, Ellipse } from 'react-konva';
import { Stage } from 'react-konva';
import { Layer } from 'react-konva';
import useMeasure from 'react-use-measure';
import { useAtom } from 'jotai';
import { useRef, useState, useEffect } from 'react';
import Konva from 'konva';
import { uid } from 'uid';

import CanvasToolBar from '@/features/canvasEditor/components/CanvasToolBar';
import { stageAtom } from '@/features/canvasEditor/store/stageAtom';
import { selectedCanvasToolAtom } from '@/features/canvasEditor/store/selectedCanvasToolAtom';
import { TCanvasTool } from '@/features/canvasEditor/components/CanvasToolBar';

// Define interfaces for each shape type to manage them properly
interface IShapeBase {
  id: string;
  type: TCanvasTool;
}

interface IRectProps extends IShapeBase {
  type: 'rectangle';
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

interface IEllipseProps extends IShapeBase {
  type: 'ellipse';
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

interface IArrowProps extends IShapeBase {
  type: 'arrow';
  points: number[];
  fill: string;
  stroke: string;
  strokeWidth: number;
}

interface ILineProps extends IShapeBase {
  type: 'line';
  points: number[];
  stroke: string;
  strokeWidth: number;
}

type ShapeProps = IRectProps | IEllipseProps | IArrowProps | ILineProps;

export default function CanvasEditor() {
  const initRef = useRef(false);
  const [parentRef, bounds] = useMeasure();
  const [stage, setStage] = useAtom(stageAtom);
  const [selectedTool] = useAtom(selectedCanvasToolAtom);

  // Store shapes as React state with proper typing
  const [shapes, setShapes] = useState<ShapeProps[]>([]);
  // Temporary shape being drawn
  const [curShapeProps, setCurShapeProps] = useState<ShapeProps | null>(null);
  const [startPos, setStartPos] = useState<Konva.Vector2d | null>(null);
  // Selected shape for transformations
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);

  // Clear selection when tool changes
  useEffect(() => {
    if (selectedTool !== 'pointer') {
      setSelectedId(null);
    }
  }, [selectedTool]);

  const createShapeProps = (pos: Konva.Vector2d, tool: TCanvasTool): ShapeProps | null => {
    switch (tool) {
      case 'rectangle':
        return {
          id: uid(8),
          type: 'rectangle',
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          fill: '#fff',
          stroke: '#000',
          strokeWidth: 2
        };
      case 'ellipse':
        return {
          id: uid(8),
          type: 'ellipse',
          x: pos.x,
          y: pos.y,
          radiusX: 0,
          radiusY: 0,
          fill: '#fff',
          stroke: '#000',
          strokeWidth: 2
        };
      case 'arrow':
        return {
          id: uid(8),
          type: 'arrow',
          points: [pos.x, pos.y, pos.x, pos.y],
          fill: '#fff',
          stroke: '#000',
          strokeWidth: 2
        };
      case 'line':
        return {
          id: uid(8),
          type: 'line',
          points: [pos.x, pos.y, pos.x, pos.y],
          stroke: '#000',
          strokeWidth: 2
        };
      default:
        return null;
    }
  };

  const updateShapeProps = (pos: Konva.Vector2d) => {
    if (!curShapeProps || !startPos) return;

    const width = pos.x - startPos.x;
    const height = pos.y - startPos.y;

    switch (curShapeProps.type) {
      case 'rectangle':
        setCurShapeProps({
          ...curShapeProps,
          width,
          height
        } as IRectProps);
        break;
      case 'ellipse':
        setCurShapeProps({
          ...curShapeProps,
          radiusX: Math.abs(width) / 2,
          radiusY: Math.abs(height) / 2,
          x: startPos.x + width / 2,
          y: startPos.y + height / 2
        } as IEllipseProps);
        break;
      case 'arrow':
      case 'line':
        setCurShapeProps({
          ...curShapeProps,
          points: [startPos.x, startPos.y, pos.x, pos.y]
        } as IArrowProps | ILineProps);
        break;
    }
  };

  // Handle shape position update when dragging
  const handleDragEnd = (e: any, id: string) => {
    const { x, y } = e.target.position();

    setShapes((prev) =>
      prev.map((shape) => {
        if (shape.id === id) {
          if (shape.type === 'rectangle' || shape.type === 'ellipse') {
            return { ...shape, x, y };
          } else if (shape.type === 'arrow' || shape.type === 'line') {
            // For arrow and line, we need to move all points
            const oldPoints = [...shape.points];
            const dx = x - e.target.x();
            const dy = y - e.target.y();

            const newPoints = [];
            for (let i = 0; i < oldPoints.length; i += 2) {
              newPoints.push(oldPoints[i] + dx);
              newPoints.push(oldPoints[i + 1] + dy);
            }

            return { ...shape, points: newPoints };
          }
        }
        return shape;
      })
    );
  };

  // Handle selecting a shape
  const handleShapeSelect = (id: string) => {
    if (selectedTool === 'pointer') {
      setSelectedId(id);
    }
  };

  // Attach transformer to a node when selected
  const attachTransformer = (node: any) => {
    if (node && transformerRef.current) {
      transformerRef.current.nodes([node]);
    }
  };

  // Check if we're clicking on an existing shape or creating a new one
  const handleStageClick = (e: any) => {
    if (!stage) return;

    // Get the clicked position
    const pos = stage.getRelativePointerPosition();
    if (!pos) return;

    // If we're using the pointer tool, handle selection
    if (selectedTool === 'pointer') {
      // Check if we clicked on a shape by getting the target
      const clickedOnEmpty = e.target === e.currentTarget;

      if (clickedOnEmpty) {
        // Clicked on empty canvas, clear selection
        setSelectedId(null);
      }
      return;
    }

    // If we're using a drawing tool, create a new shape
    const newShapeProps = createShapeProps(pos, selectedTool);
    if (!newShapeProps) return;

    setCurShapeProps(newShapeProps);
    setStartPos(pos);
  };

  // Common props for all shapes
  const getCommonProps = (shape: ShapeProps, isSelected: boolean) => ({
    draggable: selectedTool === 'pointer',
    onClick: () => handleShapeSelect(shape.id),
    onTap: () => handleShapeSelect(shape.id),
    onDragEnd: (e: any) => handleDragEnd(e, shape.id),
    ref: isSelected ? attachTransformer : undefined
  });

  // Render a shape based on its type
  const renderShape = (shape: ShapeProps) => {
    const isSelected = selectedId === shape.id;
    const commonProps = getCommonProps(shape, isSelected);

    switch (shape.type) {
      case 'rectangle':
        return <Rect key={shape.id} {...shape} {...commonProps} />;
      case 'ellipse':
        return <Ellipse key={shape.id} {...shape} {...commonProps} />;
      case 'arrow':
        return <Arrow key={shape.id} {...shape} {...commonProps} />;
      case 'line':
        return <Line key={shape.id} {...shape} {...commonProps} />;
      default:
        return null;
    }
  };

  // Render the currently drawing shape
  const renderCurrentShape = () => {
    if (!curShapeProps) return null;

    switch (curShapeProps.type) {
      case 'rectangle':
        return <Rect key={curShapeProps.id} {...curShapeProps} />;
      case 'ellipse':
        return <Ellipse key={curShapeProps.id} {...curShapeProps} />;
      case 'arrow':
        return <Arrow key={curShapeProps.id} {...curShapeProps} />;
      case 'line':
        return <Line key={curShapeProps.id} {...curShapeProps} />;
      default:
        return null;
    }
  };

  return (
    <div className='relative h-full w-full overflow-hidden' ref={parentRef}>
      <Stage
        width={bounds.width}
        height={bounds.height}
        ref={(_stage) => {
          if (initRef.current) return;
          setStage(_stage);
          initRef.current = true;
          console.log('init stage', _stage);
        }}
        onMouseDown={handleStageClick}
        onTouchStart={handleStageClick}
        onPointerMove={() => {
          if (!curShapeProps) return;
          if (!startPos) return;
          if (!stage) return;
          const pos = stage.getRelativePointerPosition();
          if (!pos) return;

          updateShapeProps(pos);
        }}
        onPointerUp={() => {
          if (!curShapeProps) return;

          // Add the current shape to the list of shapes
          setShapes((prev) => [...prev, curShapeProps]);

          // Reset current shape and start position
          setStartPos(null);
          setCurShapeProps(null);
        }}
      >
        <Layer>
          {/* Render all permanent shapes */}
          {shapes.map(renderShape)}

          {/* Render the currently drawing shape */}
          {renderCurrentShape()}

          {/* Transformer should be the last element to appear on top */}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              // Limit size to prevent negative width/height
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />
        </Layer>
      </Stage>
      <CanvasToolBar />
    </div>
  );
}
