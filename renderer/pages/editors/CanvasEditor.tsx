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

// Snapping threshold in pixels
const SNAP_THRESHOLD = 10;

// Helper to get bounding box for shapes
const getBoundingBox = (shape: ShapeProps): { x: number; y: number; width: number; height: number } => {
  switch (shape.type) {
    case 'rectangle':
      return {
        x: shape.x,
        y: shape.y,
        width: shape.width,
        height: shape.height
      };
    case 'ellipse':
      return {
        x: shape.x - shape.radiusX,
        y: shape.y - shape.radiusY,
        width: shape.radiusX * 2,
        height: shape.radiusY * 2
      };
    case 'arrow':
    case 'line': {
      // Find min/max points for arrows and lines
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      for (let i = 0; i < shape.points.length; i += 2) {
        const x = shape.points[i];
        const y = shape.points[i + 1];
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }

      return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      };
    }
    default:
      return { x: 0, y: 0, width: 0, height: 0 };
  }
};

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

  // Snapping lines (guides)
  const [horizontalGuides, setHorizontalGuides] = useState<number[]>([]);
  const [verticalGuides, setVerticalGuides] = useState<number[]>([]);

  // Clear selection when tool changes
  useEffect(() => {
    if (selectedTool !== 'pointer') {
      setSelectedId(null);
      setHorizontalGuides([]);
      setVerticalGuides([]);
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

  // Get snapping points for a shape to compare with other shapes
  const getSnapPoints = (shape: ShapeProps) => {
    const box = getBoundingBox(shape);

    // Return all important points for snapping (corners, midpoints, etc.)
    return {
      vertical: [
        box.x, // left
        box.x + box.width / 2, // center
        box.x + box.width // right
      ],
      horizontal: [
        box.y, // top
        box.y + box.height / 2, // middle
        box.y + box.height // bottom
      ]
    };
  };

  // Find snap points for the current dragging shape
  const findSnapPoints = (currentShape: ShapeProps, otherShapes: ShapeProps[]) => {
    const currentSnapPoints = getSnapPoints(currentShape);

    // Collect all potential snap lines from other shapes
    const potentialVerticalSnapLines: number[] = [];
    const potentialHorizontalSnapLines: number[] = [];

    otherShapes.forEach((shape) => {
      if (shape.id === currentShape.id) return; // Skip the current shape

      const otherSnapPoints = getSnapPoints(shape);

      // Add all vertical snap points
      potentialVerticalSnapLines.push(...otherSnapPoints.vertical);

      // Add all horizontal snap points
      potentialHorizontalSnapLines.push(...otherSnapPoints.horizontal);
    });

    // Find the closest snap points within threshold
    let verticalGuides: number[] = [];
    let horizontalGuides: number[] = [];
    let snapX: number | null = null;
    let snapY: number | null = null;

    // Find closest vertical snap
    currentSnapPoints.vertical.forEach((point) => {
      potentialVerticalSnapLines.forEach((snapLine) => {
        if (Math.abs(point - snapLine) < SNAP_THRESHOLD) {
          verticalGuides.push(snapLine);
          if (snapX === null || Math.abs(point - snapLine) < Math.abs(point - snapX)) {
            snapX = snapLine;
          }
        }
      });
    });

    // Find closest horizontal snap
    currentSnapPoints.horizontal.forEach((point) => {
      potentialHorizontalSnapLines.forEach((snapLine) => {
        if (Math.abs(point - snapLine) < SNAP_THRESHOLD) {
          horizontalGuides.push(snapLine);
          if (snapY === null || Math.abs(point - snapLine) < Math.abs(point - snapY)) {
            snapY = snapLine;
          }
        }
      });
    });

    // Remove duplicates
    verticalGuides = [...new Set(verticalGuides)];
    horizontalGuides = [...new Set(horizontalGuides)];

    return { verticalGuides, horizontalGuides, snapX, snapY };
  };

  // Calculate adjusted position for snapping during drag
  const calculateSnapPosition = (shape: ShapeProps, newX: number, newY: number) => {
    // Create a temporary shape with the new position
    let tempShape: ShapeProps;
    const dx = newX - (shape.type === 'rectangle' || shape.type === 'ellipse' ? shape.x : 0);
    const dy = newY - (shape.type === 'rectangle' || shape.type === 'ellipse' ? shape.y : 0);

    switch (shape.type) {
      case 'rectangle':
      case 'ellipse':
        tempShape = { ...shape, x: newX, y: newY };
        break;
      case 'arrow':
      case 'line': {
        // Move all points by the same delta
        const newPoints = [...shape.points];
        for (let i = 0; i < newPoints.length; i += 2) {
          newPoints[i] += dx;
          newPoints[i + 1] += dy;
        }
        tempShape = { ...shape, points: newPoints };
        break;
      }
      default:
        return { x: newX, y: newY, snap: false };
    }

    // Find snap points with other shapes
    const otherShapes = shapes.filter((s) => s.id !== shape.id);
    const { verticalGuides, horizontalGuides, snapX, snapY } = findSnapPoints(tempShape, otherShapes);

    // Update guides for visual feedback
    setVerticalGuides(verticalGuides);
    setHorizontalGuides(horizontalGuides);

    // Calculate adjusted position for snapping
    let adjustedX = newX;
    let adjustedY = newY;
    let didSnap = false;

    // Apply snapping for rectangle and ellipse
    if (shape.type === 'rectangle' || shape.type === 'ellipse') {
      const box = getBoundingBox(tempShape);

      if (snapX !== null) {
        // Find which point snapped and adjust accordingly
        const leftDiff = Math.abs(box.x - snapX);
        const centerDiff = Math.abs(box.x + box.width / 2 - snapX);
        const rightDiff = Math.abs(box.x + box.width - snapX);

        const minDiff = Math.min(leftDiff, centerDiff, rightDiff);

        if (minDiff === leftDiff) {
          adjustedX = snapX;
        } else if (minDiff === centerDiff) {
          adjustedX = snapX - box.width / 2;
        } else {
          adjustedX = snapX - box.width;
        }

        didSnap = true;
      }

      if (snapY !== null) {
        // Find which point snapped and adjust accordingly
        const topDiff = Math.abs(box.y - snapY);
        const middleDiff = Math.abs(box.y + box.height / 2 - snapY);
        const bottomDiff = Math.abs(box.y + box.height - snapY);

        const minDiff = Math.min(topDiff, middleDiff, bottomDiff);

        if (minDiff === topDiff) {
          adjustedY = snapY;
        } else if (minDiff === middleDiff) {
          adjustedY = snapY - box.height / 2;
        } else {
          adjustedY = snapY - box.height;
        }

        didSnap = true;
      }
    }
    // For arrow and line, we'd adjust the points directly instead of x,y
    // This is more complex and implementation depends on how you want snapping to behave

    return {
      x: adjustedX,
      y: adjustedY,
      snap: didSnap
    };
  };

  // Handle shape position update when dragging
  const handleDragMove = (e: any, id: string) => {
    const { x, y } = e.target.position();

    // Find the shape being dragged
    const shape = shapes.find((s) => s.id === id);
    if (!shape) return;

    // Calculate snap position
    const snapResult = calculateSnapPosition(shape, x, y);

    // Apply snap if needed
    if (snapResult.snap) {
      e.target.position({ x: snapResult.x, y: snapResult.y });
    }
  };

  // Handle drag end and update shape position
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

    // Clear guides after drag ends
    setVerticalGuides([]);
    setHorizontalGuides([]);
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
        setVerticalGuides([]);
        setHorizontalGuides([]);
      }
      return;
    }

    // If we're using a drawing tool, create a new shape
    const newShapeProps = createShapeProps(pos, selectedTool);
    if (!newShapeProps) return;

    setCurShapeProps(newShapeProps);
    setStartPos(pos);
  };

  // Handler for transformer change to apply snapping during resize
  const handleTransformEnd = (e: any, id: string) => {
    // Update shape after transformation
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale to 1
    node.scaleX(1);
    node.scaleY(1);

    setShapes((prev) =>
      prev.map((shape) => {
        if (shape.id === id) {
          if (shape.type === 'rectangle') {
            // Apply new dimensions and position
            return {
              ...shape,
              x: node.x(),
              y: node.y(),
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(5, node.height() * scaleY)
            };
          } else if (shape.type === 'ellipse') {
            return {
              ...shape,
              x: node.x(),
              y: node.y(),
              radiusX: Math.max(5, (node.width() / 2) * scaleX),
              radiusY: Math.max(5, (node.height() / 2) * scaleY)
            };
          }
          // TODO: Handle transform for arrow and line if needed
        }
        return shape;
      })
    );

    // Clear guides after transform
    setVerticalGuides([]);
    setHorizontalGuides([]);
  };

  // Common props for all shapes
  const getCommonProps = (shape: ShapeProps, isSelected: boolean) => ({
    draggable: selectedTool === 'pointer',
    onClick: () => handleShapeSelect(shape.id),
    onTap: () => handleShapeSelect(shape.id),
    onDragMove: (e: any) => handleDragMove(e, shape.id),
    onDragEnd: (e: any) => handleDragEnd(e, shape.id),
    onTransformEnd: (e: any) => handleTransformEnd(e, shape.id),
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

  // Render snap guides
  const renderGuides = () => {
    return (
      <>
        {/* Vertical guides */}
        {verticalGuides.map((guide, i) => (
          <Line
            key={`v-${i}`}
            points={[guide, 0, guide, bounds.height]}
            stroke='#1ABCFE'
            strokeWidth={1}
            dash={[4, 4]}
          />
        ))}

        {/* Horizontal guides */}
        {horizontalGuides.map((guide, i) => (
          <Line
            key={`h-${i}`}
            points={[0, guide, bounds.width, guide]}
            stroke='#1ABCFE'
            strokeWidth={1}
            dash={[4, 4]}
          />
        ))}
      </>
    );
  };

  return (
    <div className='relative h-full w-full overflow-hidden bg-[#1E1E1E]' ref={parentRef}>
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

          {/* Render snap guides */}
          {renderGuides()}

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
            // Add snapping behavior during transform
            // You could also add a custom transformer component for more advanced snapping
            rotateEnabled={false}
          />
        </Layer>
      </Stage>
      <CanvasToolBar />
    </div>
  );
}
