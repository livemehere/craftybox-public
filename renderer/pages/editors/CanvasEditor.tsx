import { Rect, Transformer, Arrow, Line, Ellipse, Circle } from 'react-konva';
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

/**
 * TODO:
 * - snap bug with Ellipse
 */

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
// Rotation snap angles in degrees
const ROTATION_SNAPS = [
  0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345
];
// 줌 관련 상수
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;
const ZOOM_FACTOR = 1.1; // 휠 한 번에 10% 확대/축소

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

  // 선택된 라인/화살표의 앵커 포인트 핸들을 위한 상태 추가
  const [lineEndpoints, setLineEndpoints] = useState<{ start: Konva.Vector2d; end: Konva.Vector2d } | null>(null);

  // Snapping lines (guides)
  const [horizontalGuides, setHorizontalGuides] = useState<number[]>([]);
  const [verticalGuides, setVerticalGuides] = useState<number[]>([]);

  // Ctrl key state to toggle snapping
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);

  // ViewPort 관련 상태 추가
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [lastPointerPosition, setLastPointerPosition] = useState<Konva.Vector2d | null>(null);

  // 줌 관련 상태 추가
  const [scale, setScale] = useState(1);

  // Clear selection when tool changes
  useEffect(() => {
    if (selectedTool !== 'pointer') {
      setSelectedId(null);
      setHorizontalGuides([]);
      setVerticalGuides([]);
    }
  }, [selectedTool]);

  // Add keyboard event listeners for Ctrl key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.key === 'Meta') {
        setIsCtrlPressed(true);

        // Clear guides when Ctrl/Cmd is pressed
        if (isCtrlPressed) {
          setHorizontalGuides([]);
          setVerticalGuides([]);
        }
      }

      // 스페이스바 감지
      if (e.key === ' ' || e.code === 'Space') {
        setIsSpacePressed(true);
        document.body.style.cursor = 'grab';
      }

      // '0' 키를 눌렀을 때 줌 리셋
      if (e.key === '0') {
        if (stage) {
          setScale(1);
          stage.scale({ x: 1, y: 1 });
          stage.position({ x: 0, y: 0 });
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.key === 'Meta') {
        setIsCtrlPressed(false);
      }

      // 스페이스바 해제
      if (e.key === ' ' || e.code === 'Space') {
        setIsSpacePressed(false);
        setIsPanning(false);
        document.body.style.cursor = '';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isCtrlPressed]);

  // 마우스 버튼 이벤트 리스너 추가
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      // 마우스 휠 버튼(보통 1, 중간 버튼)
      if (e.button === 1) {
        setIsPanning(true);
        document.body.style.cursor = 'grabbing';
        // 패닝 모드에서 Transformer 비활성화
        if (transformerRef.current) {
          transformerRef.current.nodes([]);
        }
      } else if (e.button === 0 && isSpacePressed) {
        // 스페이스 + 좌클릭 조합
        setIsPanning(true);
        document.body.style.cursor = 'grabbing';
        // 패닝 모드에서 Transformer 비활성화
        if (transformerRef.current) {
          transformerRef.current.nodes([]);
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 1) {
        setIsPanning(false);
        document.body.style.cursor = '';
      } else if (e.button === 0 && isSpacePressed) {
        // 좌클릭 해제 시 스페이스가 여전히 눌려있으면 grab 커서로 돌아감
        setIsPanning(false);
        document.body.style.cursor = isSpacePressed ? 'grab' : '';
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSpacePressed]);

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
    // If Ctrl is pressed, disable snapping
    if (isCtrlPressed) {
      return { verticalGuides: [], horizontalGuides: [], snapX: null, snapY: null };
    }

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
    // If Ctrl is pressed, disable snapping
    if (isCtrlPressed) {
      return { x: newX, y: newY, snap: false };
    }

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

  // Handle transformer drag move for snapping
  const handleTransformerDragMove = (e: any) => {
    // If Ctrl is pressed, disable snapping
    if (isCtrlPressed) {
      setVerticalGuides([]);
      setHorizontalGuides([]);
      return;
    }

    const transformer = e.target;
    const selectedNode = transformer.nodes()[0];
    if (!selectedNode) return;

    const shape = shapes.find((s) => s.id === selectedId);
    if (!shape) return;

    // Get current position of the node
    const box = selectedNode.getClientRect();

    // Collect all potential snap lines from other shapes
    const potentialVerticalLines: number[] = [];
    const potentialHorizontalLines: number[] = [];

    shapes.forEach((otherShape) => {
      if (otherShape.id === selectedId) return;

      const otherBox = getBoundingBox(otherShape);

      // Add vertical lines (left, center, right)
      potentialVerticalLines.push(otherBox.x, otherBox.x + otherBox.width / 2, otherBox.x + otherBox.width);

      // Add horizontal lines (top, middle, bottom)
      potentialHorizontalLines.push(otherBox.y, otherBox.y + otherBox.height / 2, otherBox.y + otherBox.height);
    });

    // Check for snapping
    const verticalGuides: number[] = [];
    const horizontalGuides: number[] = [];

    // Check for snapping on all 8 control points
    const points = [
      { x: box.x, y: box.y }, // top-left
      { x: box.x + box.width / 2, y: box.y }, // top-center
      { x: box.x + box.width, y: box.y }, // top-right
      { x: box.x, y: box.y + box.height / 2 }, // middle-left
      { x: box.x + box.width, y: box.y + box.height / 2 }, // middle-right
      { x: box.x, y: box.y + box.height }, // bottom-left
      { x: box.x + box.width / 2, y: box.y + box.height }, // bottom-center
      { x: box.x + box.width, y: box.y + box.height } // bottom-right
    ];

    points.forEach((point) => {
      // Check vertical snapping
      potentialVerticalLines.forEach((line) => {
        if (Math.abs(point.x - line) < SNAP_THRESHOLD) {
          verticalGuides.push(line);
        }
      });

      // Check horizontal snapping
      potentialHorizontalLines.forEach((line) => {
        if (Math.abs(point.y - line) < SNAP_THRESHOLD) {
          horizontalGuides.push(line);
        }
      });
    });

    // Update guides for visual feedback
    setVerticalGuides([...new Set(verticalGuides)]);
    setHorizontalGuides([...new Set(horizontalGuides)]);
  };

  // Handle transformer transform (resize) for snapping
  const handleTransformerTransform = (e: any) => {
    // If Ctrl is pressed, disable snapping
    if (isCtrlPressed) {
      setVerticalGuides([]);
      setHorizontalGuides([]);
      return;
    }

    const transformer = e.target;
    const selectedNode = transformer.nodes()[0];
    if (!selectedNode) return;

    const shape = shapes.find((s) => s.id === selectedId);
    if (!shape) return;

    // Get current position and size of the node
    const box = selectedNode.getClientRect();

    // Collect all potential snap lines from other shapes
    const potentialVerticalLines: number[] = [];
    const potentialHorizontalLines: number[] = [];

    shapes.forEach((otherShape) => {
      if (otherShape.id === selectedId) return;

      const otherBox = getBoundingBox(otherShape);

      // Add vertical lines (left, center, right)
      potentialVerticalLines.push(otherBox.x, otherBox.x + otherBox.width / 2, otherBox.x + otherBox.width);

      // Add horizontal lines (top, middle, bottom)
      potentialHorizontalLines.push(otherBox.y, otherBox.y + otherBox.height / 2, otherBox.y + otherBox.height);
    });

    // Check for snapping on the edges being resized
    // We need to identify which anchor is being used
    const anchorName = transformer.getActiveAnchor();
    if (!anchorName) return;

    const verticalGuides: number[] = [];
    const horizontalGuides: number[] = [];

    // Determine which points to check based on the active anchor
    let pointsToCheck: { x: number; y: number }[] = [];

    if (anchorName.includes('left')) {
      pointsToCheck.push({ x: box.x, y: box.y + box.height / 2 }); // left edge
    }
    if (anchorName.includes('right')) {
      pointsToCheck.push({ x: box.x + box.width, y: box.y + box.height / 2 }); // right edge
    }
    if (anchorName.includes('top')) {
      pointsToCheck.push({ x: box.x + box.width / 2, y: box.y }); // top edge
    }
    if (anchorName.includes('bottom')) {
      pointsToCheck.push({ x: box.x + box.width / 2, y: box.y + box.height }); // bottom edge
    }

    // Add corner point if it's a corner anchor
    if (anchorName === 'top-left') {
      pointsToCheck.push({ x: box.x, y: box.y });
    } else if (anchorName === 'top-right') {
      pointsToCheck.push({ x: box.x + box.width, y: box.y });
    } else if (anchorName === 'bottom-left') {
      pointsToCheck.push({ x: box.x, y: box.y + box.height });
    } else if (anchorName === 'bottom-right') {
      pointsToCheck.push({ x: box.x + box.width, y: box.y + box.height });
    }

    // If no specific anchor point was determined, check all corner points
    if (pointsToCheck.length === 0) {
      pointsToCheck = [
        { x: box.x, y: box.y }, // top-left
        { x: box.x + box.width, y: box.y }, // top-right
        { x: box.x, y: box.y + box.height }, // bottom-left
        { x: box.x + box.width, y: box.y + box.height } // bottom-right
      ];
    }

    // Find the closest snap points
    pointsToCheck.forEach((point) => {
      // Check vertical snapping
      potentialVerticalLines.forEach((line) => {
        const distance = Math.abs(point.x - line);
        if (distance < SNAP_THRESHOLD) {
          verticalGuides.push(line);
        }
      });

      // Check horizontal snapping
      potentialHorizontalLines.forEach((line) => {
        const distance = Math.abs(point.y - line);
        if (distance < SNAP_THRESHOLD) {
          horizontalGuides.push(line);
        }
      });
    });

    // Update guides for visual feedback
    setVerticalGuides([...new Set(verticalGuides)]);
    setHorizontalGuides([...new Set(horizontalGuides)]);

    // Note: For actual snapping during resize, we would need to implement
    // a custom transform operation which is complex with Konva.
    // For now, we just show guidelines during resizing.
  };

  // Handle selecting a shape
  const handleShapeSelect = (id: string) => {
    if (selectedTool === 'pointer') {
      setSelectedId(id);

      // 라인이나 화살표가 선택된 경우 양 끝점 위치 저장
      const selectedShape = shapes.find((s) => s.id === id);
      if (selectedShape && (selectedShape.type === 'line' || selectedShape.type === 'arrow')) {
        setLineEndpoints({
          start: { x: selectedShape.points[0], y: selectedShape.points[1] },
          end: { x: selectedShape.points[2], y: selectedShape.points[3] }
        });
      } else {
        setLineEndpoints(null);
      }
    }
  };

  // Attach transformer to a node when selected
  const attachTransformer = (node: any) => {
    if (node && transformerRef.current && !isPanning) {
      // Get the selected shape
      const shape = shapes.find((s) => s.id === selectedId);

      if (shape && (shape.type === 'line' || shape.type === 'arrow')) {
        // 라인과 화살표에는 Transformer를 사용하지 않음
        transformerRef.current.nodes([]);
      } else {
        // For rectangles and ellipses, enable all anchors
        transformerRef.current.enabledAnchors([
          'top-left',
          'top-center',
          'top-right',
          'middle-left',
          'middle-right',
          'bottom-left',
          'bottom-center',
          'bottom-right'
        ]);
        // Enable rotation
        transformerRef.current.rotateEnabled(true);
        transformerRef.current.nodes([node]);
      }
    } else if (transformerRef.current && isPanning) {
      // 패닝 모드에서는 Transformer 비활성화
      transformerRef.current.nodes([]);
    }
  };

  // Check if we're clicking on an existing shape or creating a new one
  const handleStageClick = (e: any) => {
    if (!stage) return;

    // 패닝 모드인 경우에는 패닝 시작 - 도형 선택/생성 처리는 하지 않음
    if (isPanning) {
      // 마우스 위치 저장
      const pointerPosition = stage.getPointerPosition();
      if (pointerPosition) {
        setLastPointerPosition(pointerPosition);
      }
      return;
    }

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

        // 명시적으로 Transformer 제거
        if (transformerRef.current) {
          transformerRef.current.nodes([]);
        }

        // 라인 엔드포인트 상태 초기화
        setLineEndpoints(null);
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
          } else if (shape.type === 'line' || shape.type === 'arrow') {
            // For lines and arrows, update the endpoints based on transform

            // Calculate new positions for endpoints
            const startX = node.x();
            const startY = node.y();
            const endX = startX + node.width() * scaleX;
            const endY = startY + node.height() * scaleY;

            return {
              ...shape,
              points: [startX, startY, endX, endY]
            };
          }
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
    draggable: selectedTool === 'pointer' && !isPanning,
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
        return <Arrow key={shape.id} {...shape} {...commonProps} hitStrokeWidth={10} />;
      case 'line':
        return <Line key={shape.id} {...shape} {...commonProps} hitStrokeWidth={10} />;
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
        return <Arrow key={curShapeProps.id} {...curShapeProps} hitStrokeWidth={10} />;
      case 'line':
        return <Line key={curShapeProps.id} {...curShapeProps} hitStrokeWidth={10} />;
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
            stroke='#F24E1E'
            strokeWidth={1}
            dash={[4, 4]}
          />
        ))}

        {/* Horizontal guides */}
        {horizontalGuides.map((guide, i) => (
          <Line
            key={`h-${i}`}
            points={[0, guide, bounds.width, guide]}
            stroke='#F24E1E'
            strokeWidth={1}
            dash={[4, 4]}
          />
        ))}
      </>
    );
  };

  // 라인/화살표 앵커 드래그 핸들러
  const handleLineAnchorDragMove = (e: any, isStart: boolean) => {
    // 현재 드래그 중인 앵커 포인트의 새 위치
    const pos = e.target.position();

    if (lineEndpoints) {
      // 업데이트된 앵커 포인트 위치 설정
      setLineEndpoints((prev) => {
        if (!prev) return null;
        return isStart ? { ...prev, start: { x: pos.x, y: pos.y } } : { ...prev, end: { x: pos.x, y: pos.y } };
      });

      // 실시간으로 라인 업데이트
      setShapes((prev) =>
        prev.map((shape) => {
          if (shape.id === selectedId && (shape.type === 'line' || shape.type === 'arrow')) {
            const newPoints = [...shape.points];
            if (isStart) {
              newPoints[0] = pos.x;
              newPoints[1] = pos.y;
            } else {
              newPoints[2] = pos.x;
              newPoints[3] = pos.y;
            }
            return {
              ...shape,
              points: newPoints
            };
          }
          return shape;
        })
      );
    }
  };

  // 라인/화살표 앵커 드래그 종료 핸들러
  const handleLineAnchorDragEnd = () => {
    if (!selectedId || !lineEndpoints) return;

    // 데이터 모델의 shapes 배열 업데이트 확인
    const updatedShape = shapes.find((s) => s.id === selectedId);
    if (updatedShape && (updatedShape.type === 'line' || updatedShape.type === 'arrow')) {
      // 앵커 위치와 라인 데이터를 동기화
      setLineEndpoints({
        start: { x: updatedShape.points[0], y: updatedShape.points[1] },
        end: { x: updatedShape.points[2], y: updatedShape.points[3] }
      });
    }
  };

  // 휠 이벤트 처리 함수
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    // Ctrl 키나 Cmd 키를 누른 상태에서만 줌 작동
    if (e.evt.ctrlKey || e.evt.metaKey) {
      e.evt.preventDefault();

      if (stage) {
        // 현재 마우스 포인터 위치
        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        // 현재 스케일
        const oldScale = scale;

        // 확대/축소 계산
        const newScale =
          e.evt.deltaY < 0 ? Math.min(oldScale * ZOOM_FACTOR, MAX_ZOOM) : Math.max(oldScale / ZOOM_FACTOR, MIN_ZOOM);

        // 스케일 변화율
        const scaleChange = newScale / oldScale;

        // 확대/축소 중심점 계산
        const newPos = {
          x: pointer.x - (pointer.x - stage.x()) * scaleChange,
          y: pointer.y - (pointer.y - stage.y()) * scaleChange
        };

        // 상태 업데이트
        setScale(newScale);

        // Stage 업데이트
        stage.scale({ x: newScale, y: newScale });
        stage.position(newPos);
      }
    } else {
      // 일반 스크롤은 기본 동작 유지 (페이지 스크롤)
      // 필요한 경우 여기에 수직/수평 스크롤 로직 추가 가능
      return;
    }
  };

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-[#1E1E1E] ${isSpacePressed ? 'cursor-grab' : ''}`}
      ref={parentRef}
    >
      <Stage
        width={bounds.width}
        height={bounds.height}
        ref={(_stage) => {
          if (initRef.current) return;
          setStage(_stage);
          initRef.current = true;
        }}
        draggable={false}
        scaleX={scale}
        scaleY={scale}
        onMouseDown={handleStageClick}
        onTouchStart={handleStageClick}
        onPointerMove={(e) => {
          // 패닝 모드일 때만 패닝 수행
          if (isPanning && stage) {
            e.evt.preventDefault();

            // 패닝 모드에서 마우스 이동 시 Stage 이동
            const pointerPosition = stage.getPointerPosition();
            if (pointerPosition && lastPointerPosition) {
              const dx = pointerPosition.x - lastPointerPosition.x;
              const dy = pointerPosition.y - lastPointerPosition.y;

              // Stage position 업데이트
              stage.position({
                x: stage.x() + dx,
                y: stage.y() + dy
              });

              // 마지막 포인터 위치 업데이트
              setLastPointerPosition(pointerPosition);
            } else if (pointerPosition) {
              // 첫 이동 시 좌표만 저장
              setLastPointerPosition(pointerPosition);
            }
            return;
          }

          // 기존 도형 그리기 코드
          if (!curShapeProps) return;
          if (!startPos) return;
          if (!stage) return;
          const pos = stage.getRelativePointerPosition();
          if (!pos) return;

          updateShapeProps(pos);
        }}
        onPointerUp={() => {
          // 패닝 모드의 마우스 좌표 초기화
          setLastPointerPosition(null);

          // 도형 그리기 완료 처리
          if (!curShapeProps) return;

          // Add the current shape to the list of shapes
          setShapes((prev) => [...prev, curShapeProps]);

          // Reset current shape and start position
          setStartPos(null);
          setCurShapeProps(null);
        }}
        onWheel={handleWheel}
      >
        <Layer>
          {/* Render all permanent shapes */}
          {shapes.map(renderShape)}

          {/* Render the currently drawing shape */}
          {renderCurrentShape()}

          {/* 선택된 라인/화살표의 앵커 핸들 렌더링 */}
          {selectedId && lineEndpoints && !isPanning && (
            <>
              {/* 시작점 앵커 */}
              <Circle
                x={lineEndpoints.start.x}
                y={lineEndpoints.start.y}
                radius={8}
                fill='#1ABCFE'
                stroke='#fff'
                strokeWidth={1}
                draggable
                onDragMove={(e) => handleLineAnchorDragMove(e, true)}
                onDragEnd={() => handleLineAnchorDragEnd()}
              />
              {/* 끝점 앵커 */}
              <Circle
                x={lineEndpoints.end.x}
                y={lineEndpoints.end.y}
                radius={8}
                fill='#FF7262'
                stroke='#fff'
                strokeWidth={1}
                draggable
                onDragMove={(e) => handleLineAnchorDragMove(e, false)}
                onDragEnd={() => handleLineAnchorDragEnd()}
              />
            </>
          )}

          {/* Render snap guides */}
          {renderGuides()}

          {/* Transformer should be the last element to appear on top */}
          {!isPanning && (
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                // Limit size to prevent negative width/height
                if (newBox.width < 5 || newBox.height < 5) {
                  return oldBox;
                }

                // Get the selected shape to check its type
                const shape = shapes.find((s) => s.id === selectedId);

                // For lines and arrows, allow any transformation (will be handled in transform end)
                if (shape && (shape.type === 'line' || shape.type === 'arrow')) {
                  return newBox;
                }

                // If Ctrl is pressed, disable snapping and return the box as is
                if (isCtrlPressed) {
                  return newBox;
                }

                // Rest of the existing snapping logic for rectangles and ellipses
                // Collect all potential snap lines from other shapes for snapping
                const potentialVerticalLines: number[] = [];
                const potentialHorizontalLines: number[] = [];

                shapes.forEach((otherShape) => {
                  if (otherShape.id === selectedId) return; // Skip the current shape

                  const otherBox = getBoundingBox(otherShape);

                  // Add vertical lines (left, center, right)
                  potentialVerticalLines.push(
                    otherBox.x, // left
                    otherBox.x + otherBox.width / 2, // center
                    otherBox.x + otherBox.width // right
                  );

                  // Add horizontal lines (top, middle, bottom)
                  potentialHorizontalLines.push(
                    otherBox.y, // top
                    otherBox.y + otherBox.height / 2, // middle
                    otherBox.y + otherBox.height // bottom
                  );
                });

                // Create a modified version of newBox to adjust
                const adjustedBox = { ...newBox };

                // Variables to track snap points
                let snapX: number | null = null;
                let snapY: number | null = null;

                // Edges/positions to check
                const left = newBox.x;
                const center = newBox.x + newBox.width / 2;
                const right = newBox.x + newBox.width;
                const top = newBox.y;
                const middle = newBox.y + newBox.height / 2;
                const bottom = newBox.y + newBox.height;

                // Points to check for snapping
                interface Point {
                  x: number;
                  y: number;
                  position: string;
                }

                const pointsToCheck: Point[] = [
                  { x: left, y: top, position: 'top-left' },
                  { x: center, y: top, position: 'top-center' },
                  { x: right, y: top, position: 'top-right' },
                  { x: left, y: middle, position: 'middle-left' },
                  { x: right, y: middle, position: 'middle-right' },
                  { x: left, y: bottom, position: 'bottom-left' },
                  { x: center, y: bottom, position: 'bottom-center' },
                  { x: right, y: bottom, position: 'bottom-right' }
                ];

                // Check for vertical snapping
                const verticalGuides: number[] = [];
                let minXDistance = SNAP_THRESHOLD;
                let snappedPoint: Point | null = null;

                for (const point of pointsToCheck) {
                  for (const line of potentialVerticalLines) {
                    const distance = Math.abs(point.x - line);
                    if (distance < minXDistance) {
                      minXDistance = distance;
                      snapX = line;
                      snappedPoint = point;
                      verticalGuides.push(line);
                    }
                  }
                }

                // Check for horizontal snapping
                const horizontalGuides: number[] = [];
                let minYDistance = SNAP_THRESHOLD;
                let snappedYPoint: Point | null = null;

                for (const point of pointsToCheck) {
                  for (const line of potentialHorizontalLines) {
                    const distance = Math.abs(point.y - line);
                    if (distance < minYDistance) {
                      minYDistance = distance;
                      snapY = line;
                      snappedYPoint = point;
                      horizontalGuides.push(line);
                    }
                  }
                }

                // Update guides for visual feedback
                setVerticalGuides([...new Set(verticalGuides)]);
                setHorizontalGuides([...new Set(horizontalGuides)]);

                // Apply vertical snapping if found
                if (snapX !== null && snappedPoint !== null) {
                  if (snappedPoint.position.includes('left')) {
                    // Left edge snapped
                    const deltaX = snapX - newBox.x;
                    adjustedBox.x = snapX;
                    adjustedBox.width -= deltaX;
                  } else if (snappedPoint.position.includes('right')) {
                    // Right edge snapped
                    adjustedBox.width = snapX - newBox.x;
                  } else if (snappedPoint.position.includes('center')) {
                    // Center snapped
                    adjustedBox.x = snapX - newBox.width / 2;
                  }
                }

                // Apply horizontal snapping if found
                if (snapY !== null && snappedYPoint !== null) {
                  if (snappedYPoint.position.includes('top')) {
                    // Top edge snapped
                    const deltaY = snapY - newBox.y;
                    adjustedBox.y = snapY;
                    adjustedBox.height -= deltaY;
                  } else if (snappedYPoint.position.includes('bottom')) {
                    // Bottom edge snapped
                    adjustedBox.height = snapY - newBox.y;
                  } else if (snappedYPoint.position.includes('middle')) {
                    // Middle snapped
                    adjustedBox.y = snapY - newBox.height / 2;
                  }
                }

                return adjustedBox;
              }}
              // Allow free resize (no aspect ratio lock)
              keepRatio={false}
              // Enable all handlers for each edge and corner
              enabledAnchors={[
                'top-left',
                'top-center',
                'top-right',
                'middle-left',
                'middle-right',
                'bottom-left',
                'bottom-center',
                'bottom-right'
              ]}
              // Add rotation snapping
              rotationSnaps={isCtrlPressed ? [] : ROTATION_SNAPS}
              // Add dragging event to support transformer snapping
              onDragMove={handleTransformerDragMove}
              // Add transform event to support resizing snapping
              onTransform={handleTransformerTransform}
              // Enable rotation by default
              rotateEnabled={true}
            />
          )}
        </Layer>
      </Stage>
      <CanvasToolBar />

      {/* 줌 레벨 표시 */}
      <div className='absolute bottom-2 left-2 rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-70'>
        {Math.round(scale * 100)}%
      </div>
    </div>
  );
}
