import { Rect, Transformer, Arrow, Line, Ellipse, Circle } from 'react-konva';
import { Stage } from 'react-konva';
import { Layer } from 'react-konva';
import { useAtom } from 'jotai';
import { useRef, useState, useEffect, useCallback } from 'react';
import Konva from 'konva';
import { uid } from 'uid';
import { KonvaEventObject } from 'konva/lib/Node';

import CanvasToolBar from '@/features/canvasEditor/components/CanvasToolBar';
import { stageAtom } from '@/features/canvasEditor/store/stageAtom';
import { selectedCanvasToolAtom } from '@/features/canvasEditor/store/selectedCanvasToolAtom';
import { TCanvasTool } from '@/features/canvasEditor/components/CanvasToolBar';

/**
 * TODO:
 * - snap bug with Ellipse
 * - cmd or ctrl + dragging -> create selection area and select all. for this implement multiple selection.
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

// Ruler 관련 상수
const RULER_SIZE = 20;
const RULER_COLOR = '#363636';
const RULER_LINE_COLOR = '#666666';
const RULER_TEXT_COLOR = '#BBBBBB';

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

// Ruler 컴포넌트 구현
// 눈금자 계산 유틸리티 함수
const getOptimalRulerSpacing = (scale: number): { spacing: number; step: number; majorStep: number } => {
  const baseUnit = 100;
  let spacing = baseUnit;
  let step = 10;
  let majorStep = 100;

  // 최소 step 값 (너무 작아지지 않도록)
  const MIN_STEP = 5;

  if (scale >= 4) {
    spacing = 10;
    step = 1;
    majorStep = 10;
  } else if (scale >= 2) {
    spacing = 20;
    step = 2;
    majorStep = 20;
  } else if (scale >= 1) {
    spacing = 50;
    step = 5;
    majorStep = 50;
  } else if (scale >= 0.5) {
    spacing = 100;
    step = 10;
    majorStep = 100;
  } else if (scale >= 0.25) {
    spacing = 200;
    step = 20;
    majorStep = 200;
  } else if (scale >= 0.1) {
    spacing = 500;
    step = 50;
    majorStep = 500;
  } else {
    // 매우 작은 scale 값에 대해 매우 큰 간격 사용
    spacing = 1000;
    step = 100;
    majorStep = 1000;
  }

  // step이 너무 작아지지 않도록 보장
  step = Math.max(step, MIN_STEP);

  return { spacing, step, majorStep };
};

// 수평 눈금자 (가로 ruler) 컴포넌트
const HorizontalRuler = ({ scale, offset, width }: { scale: number; offset: number; width: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 설정
    canvas.width = width;
    canvas.height = RULER_SIZE;

    // 캔버스 초기화
    ctx.fillStyle = RULER_COLOR;
    ctx.fillRect(0, 0, width, RULER_SIZE);

    // scale 값이 너무 작으면 눈금 그리지 않음 (안전장치)
    if (scale < 0.001) {
      return;
    }

    // 오프셋 값이 비정상적으로 크면 제한 (안전장치)
    const safeOffset = isFinite(offset) ? Math.max(-100000, Math.min(100000, offset)) : 0;

    // 눈금 계산
    const { spacing, step } = getOptimalRulerSpacing(scale);

    // 작은 눈금 그리기
    ctx.strokeStyle = RULER_LINE_COLOR;
    ctx.fillStyle = RULER_TEXT_COLOR;
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // 절대적인 최대 눈금 개수 제한 (1000개 이상 그리지 않음)
    const MAX_ABSOLUTE_TICKS = 1000;

    // 화면에 보이는 최대 눈금 개수 계산
    let maxTicks = Math.ceil(width / (step * scale)) + 1;

    // 눈금 개수가 비정상적으로 크면 제한 (추가 안전장치)
    if (!isFinite(maxTicks) || maxTicks > MAX_ABSOLUTE_TICKS) {
      maxTicks = MAX_ABSOLUTE_TICKS;
    }

    // 시작 위치 계산 (픽셀 위치를 눈금 단위로 변환)
    const firstVisibleTick = Math.floor(safeOffset / step) * step;

    // 최적화된 방식으로 눈금 그리기
    for (let i = 0; i < maxTicks; i++) {
      const tickValue = firstVisibleTick + i * step;
      const pos = Math.round((tickValue - safeOffset) * scale);

      // 화면 밖으로 나가면 그리지 않음
      if (pos < 0 || pos > width) continue;

      // 큰 눈금일 경우 더 길게
      const isMajor = tickValue % spacing === 0;
      const tickHeight = isMajor ? 12 : 8;

      ctx.beginPath();
      ctx.moveTo(pos, RULER_SIZE);
      ctx.lineTo(pos, RULER_SIZE - tickHeight);
      ctx.stroke();

      // 큰 눈금에만 숫자 표시
      if (isMajor) {
        ctx.fillText(tickValue.toString(), pos, 0);
      }
    }
  }, [scale, offset, width]);

  return <canvas ref={canvasRef} className='h-full w-full' />;
};

// 수직 눈금자 (세로 ruler) 컴포넌트
const VerticalRuler = ({ scale, offset, height }: { scale: number; offset: number; height: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 설정
    canvas.width = RULER_SIZE;
    canvas.height = height;

    // 캔버스 초기화
    ctx.fillStyle = RULER_COLOR;
    ctx.fillRect(0, 0, RULER_SIZE, height);

    // scale 값이 너무 작으면 눈금 그리지 않음 (안전장치)
    if (scale < 0.001) {
      return;
    }

    // 오프셋 값이 비정상적으로 크면 제한 (안전장치)
    const safeOffset = isFinite(offset) ? Math.max(-100000, Math.min(100000, offset)) : 0;

    // 눈금 계산
    const { spacing, step } = getOptimalRulerSpacing(scale);

    // 작은 눈금 그리기
    ctx.strokeStyle = RULER_LINE_COLOR;
    ctx.fillStyle = RULER_TEXT_COLOR;
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    // 절대적인 최대 눈금 개수 제한 (1000개 이상 그리지 않음)
    const MAX_ABSOLUTE_TICKS = 1000;

    // 화면에 보이는 최대 눈금 개수 계산
    let maxTicks = Math.ceil(height / (step * scale)) + 1;

    // 눈금 개수가 비정상적으로 크면 제한 (추가 안전장치)
    if (!isFinite(maxTicks) || maxTicks > MAX_ABSOLUTE_TICKS) {
      maxTicks = MAX_ABSOLUTE_TICKS;
    }

    // 시작 위치 계산 (픽셀 위치를 눈금 단위로 변환)
    const firstVisibleTick = Math.floor(safeOffset / step) * step;

    // 최적화된 방식으로 눈금 그리기
    for (let i = 0; i < maxTicks; i++) {
      const tickValue = firstVisibleTick + i * step;
      const pos = Math.round((tickValue - safeOffset) * scale);

      // 화면 밖으로 나가면 그리지 않음
      if (pos < 0 || pos > height) continue;

      // 큰 눈금일 경우 더 길게
      const isMajor = tickValue % spacing === 0;
      const tickWidth = isMajor ? 12 : 8;

      ctx.beginPath();
      ctx.moveTo(RULER_SIZE, pos);
      ctx.lineTo(RULER_SIZE - tickWidth, pos);
      ctx.stroke();

      // 큰 눈금에만 숫자 표시
      if (isMajor) {
        // 텍스트 회전을 위해 상태 저장
        ctx.save();
        ctx.translate(12, pos);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(tickValue.toString(), 0, 0);
        ctx.restore();
      }
    }
  }, [scale, offset, height]);

  return <canvas ref={canvasRef} className='h-full w-full' />;
};

export default function CanvasEditor() {
  const initRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null); // 컨테이너 참조용 ref
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 }); // 초기값은 0으로 설정
  const [isInitialSizeMeasured, setIsInitialSizeMeasured] = useState(false); // 초기 측정 완료 여부
  const [stage, setStage] = useAtom(stageAtom);
  const [selectedTool] = useAtom(selectedCanvasToolAtom);

  // 컨테이너 크기 측정 함수
  const measureContainerSize = useCallback(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();

      // 크기가 유효한 경우에만 업데이트
      if (width > 10 && height > 10) {
        // 이전 크기와 같으면 업데이트하지 않음 (불필요한 리렌더링 방지)
        if (
          !isInitialSizeMeasured ||
          Math.abs(width - containerSize.width) > 1 ||
          Math.abs(height - containerSize.height) > 1
        ) {
          setContainerSize({ width, height });

          // 초기 측정이 완료되었음을 표시
          if (!isInitialSizeMeasured) {
            setIsInitialSizeMeasured(true);
          }
        }
      }
    }
  }, [containerSize.width, containerSize.height, isInitialSizeMeasured]);

  // 초기 마운트 및 리사이즈 이벤트 설정
  useEffect(() => {
    // 초기 마운트 시 크기 측정
    // RAF를 사용하여 레이아웃이 완전히 계산된 후 측정
    const initialMeasureTimeout = setTimeout(() => {
      requestAnimationFrame(() => {
        measureContainerSize();
      });
    }, 100); // 약간의 지연을 두어 레이아웃이 안정화될 시간 제공

    // 리사이즈 이벤트에 대해서만 크기 측정 실행
    const handleResize = () => {
      if (window.requestAnimationFrame) {
        // 리사이즈 이벤트는 빠르게 연속으로 발생하므로 requestAnimationFrame으로 디바운스
        window.requestAnimationFrame(measureContainerSize);
      } else {
        setTimeout(measureContainerSize, 66); // 약 60fps에 해당하는 시간
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(initialMeasureTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [measureContainerSize]);

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

  // 뷰포트 오프셋 계산 함수 (현재 위치 표시용)
  const getViewportOffset = (): { x: number; y: number } => {
    if (!stage) return { x: 0, y: 0 };

    // 매우 작은 scale 값에 대한 보호 장치 추가
    const safeScale = Math.max(scale, 0.001);

    // offset 값에 대한 제한 추가 (너무 큰 값 방지)
    const stageX = stage.x();
    const stageY = stage.y();

    // 값이 매우 크거나 NaN, Infinity인 경우 기본값으로 대체
    const offsetX = isFinite(-stageX / safeScale) ? -stageX / safeScale : 0;
    const offsetY = isFinite(-stageY / safeScale) ? -stageY / safeScale : 0;

    // 최대 오프셋 제한 (너무 큰 값 방지)
    const MAX_OFFSET = 100000;

    return {
      x: Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, offsetX)),
      y: Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, offsetY))
    };
  };

  // 확대/축소 및 위치 초기화
  const resetView = () => {
    setScale(1);
    if (stage) {
      stage.position({ x: 0, y: 0 });
      stage.batchDraw();
    }
  };

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
      if (e.code === 'Space') {
        setIsSpacePressed(true);
        // 스페이스 키만 눌렀을 때는 패닝 모드로 전환하지 않음
        // 커서만 변경하여 사용자에게 패닝 가능함을 알림
        document.body.style.cursor = 'grab';
      }

      // Ctrl 또는 Meta(Cmd) 키 누를 때 guide 표시 제거
      if (e.ctrlKey || e.metaKey) {
        setIsCtrlPressed(true);
      }

      // '0' 키를 누를 때 확대/축소 및 위치 초기화
      if (e.key === '0') {
        resetView();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        // 스페이스 키를 뗐을 때 패닝 중이었다면 패닝 종료
        setIsPanning(false);
        // 커서 원래대로 복원
        document.body.style.cursor = '';
      }

      if (!e.ctrlKey && !e.metaKey) {
        setIsCtrlPressed(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [resetView]);

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
        // 마우스 위치 초기화 (첫 이동 시 좌표 저장 위함)
        setLastPointerPosition(null);
      } else if (e.button === 0 && isSpacePressed) {
        // 스페이스 + 좌클릭 조합일 때만 패닝 시작
        setIsPanning(true);
        document.body.style.cursor = 'grabbing';
        // 패닝 모드에서 Transformer 비활성화
        if (transformerRef.current) {
          transformerRef.current.nodes([]);
        }
        // 마우스 위치 초기화 (첫 이동 시 좌표 저장 위함)
        setLastPointerPosition(null);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && isSpacePressed)) {
        setIsPanning(false);
        // 마우스 좌표 초기화
        setLastPointerPosition(null);
        // 스페이스 키가 여전히 눌려있으면 grab 커서로, 아니면 기본 커서로
        document.body.style.cursor = isSpacePressed ? 'grab' : '';
      }
    };

    // 마우스가 창 밖으로 나갔을 때 처리 (패닝 중에 발생할 수 있는 문제 방지)
    const handleMouseLeave = () => {
      if (isPanning) {
        setIsPanning(false);
        setLastPointerPosition(null);
        document.body.style.cursor = isSpacePressed ? 'grab' : '';
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    };
  }, [isSpacePressed, isPanning, transformerRef]);

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
            points={[guide, 0, guide, containerSize.height]}
            stroke='#F24E1E'
            strokeWidth={1}
            dash={[4, 4]}
          />
        ))}

        {/* Horizontal guides */}
        {horizontalGuides.map((guide, i) => (
          <Line
            key={`h-${i}`}
            points={[0, guide, containerSize.width, guide]}
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

  // 마우스 휠 이벤트 핸들러 - 확대/축소 기능
  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    // Ctrl 키나 Cmd 키를 누른 상태에서만 줌 작동
    if (e.evt.ctrlKey || e.evt.metaKey) {
      const oldScale = scale;
      const pointer = stage?.getPointerPosition();
      if (!pointer || !stage) return;

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale
      };

      // deltaY가 비정상적인 값인지 확인 (안전장치)
      const deltaY = isFinite(e.evt.deltaY) ? e.evt.deltaY : 0;
      if (deltaY === 0) return; // deltaY가 0이면 아무 작업도 하지 않음

      // 마우스 휠 방향에 따라 확대/축소 결정
      const newScale =
        deltaY < 0
          ? Math.min(oldScale * ZOOM_FACTOR, MAX_ZOOM) // 확대
          : Math.max(oldScale / ZOOM_FACTOR, MIN_ZOOM); // 축소

      // 스케일이 실제로 변하지 않으면 불필요한 연산 방지
      if (Math.abs(newScale - oldScale) < 0.00001) return;

      setScale(newScale);

      // mousePointTo 값이 비정상적인지 확인 (안전장치)
      if (!isFinite(mousePointTo.x) || !isFinite(mousePointTo.y)) {
        // 비정상적인 값일 경우 기본 줌 동작 수행
        stage.scale({ x: newScale, y: newScale });
        stage.batchDraw();
        return;
      }

      // 마우스 위치 기준으로 줌 적용
      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale
      };

      // 계산된 위치가 비정상적인지 확인 (안전장치)
      if (!isFinite(newPos.x) || !isFinite(newPos.y)) {
        // 비정상적인 위치일 경우 안전한 기본값 사용
        stage.scale({ x: newScale, y: newScale });
        stage.batchDraw();
        return;
      }

      stage.scale({ x: newScale, y: newScale });
      stage.position(newPos);
      stage.batchDraw();
    } else {
      // 일반 스크롤 (panning)
      if (!stage) return;

      // deltaX, deltaY가 비정상적인 값인지 확인 (안전장치)
      const dx = isFinite(e.evt.deltaX) ? e.evt.deltaX : 0;
      const dy = isFinite(e.evt.deltaY) ? e.evt.deltaY : 0;

      // 둘 다 0이면 아무 작업도 하지 않음
      if (dx === 0 && dy === 0) return;

      // Stage 위치 이동
      const stageX = stage.x();
      const stageY = stage.y();

      // 현재 위치가 비정상적인지 확인 (안전장치)
      if (!isFinite(stageX) || !isFinite(stageY)) {
        // 스테이지 위치 초기화
        stage.position({ x: 0, y: 0 });
        stage.batchDraw();
        return;
      }

      const newX = stageX - dx;
      const newY = stageY - dy;

      // 계산된 위치가 비정상적인지 확인 (안전장치)
      if (!isFinite(newX) || !isFinite(newY)) {
        return;
      }

      stage.position({ x: newX, y: newY });
      stage.batchDraw();
    }
  };

  // onPointerMove 이벤트 핸들러를 외부 함수로 추출하여 가독성 개선
  const handlePointerMove = (e: Konva.KonvaEventObject<PointerEvent>) => {
    // 패닝 모드일 때만 패닝 수행
    if (isPanning && stage) {
      e.evt.preventDefault();

      // 패닝 모드에서 마우스 이동 시 Stage 이동
      const pointerPosition = stage.getPointerPosition();

      // 유효한 포인터 위치가 있는지 확인
      if (!pointerPosition) return;

      if (lastPointerPosition) {
        // 이동 거리 계산
        const dx = pointerPosition.x - lastPointerPosition.x;
        const dy = pointerPosition.y - lastPointerPosition.y;

        // 너무 큰 이동은 무시 (비정상적인 상황 방지)
        if (isFinite(dx) && isFinite(dy) && Math.abs(dx) < 100 && Math.abs(dy) < 100) {
          // 현재 스테이지 위치 확인
          const currentX = stage.x();
          const currentY = stage.y();

          if (isFinite(currentX) && isFinite(currentY)) {
            // Stage position 업데이트
            stage.position({
              x: currentX + dx,
              y: currentY + dy
            });
            stage.batchDraw(); // 즉시 렌더링하여 부드러운 이동 보장
          }
        }
      }

      // 마지막 포인터 위치 업데이트
      setLastPointerPosition(pointerPosition);
      return;
    }

    // 기존 도형 그리기 코드
    if (!curShapeProps) return;
    if (!startPos) return;
    if (!stage) return;
    const pos = stage.getRelativePointerPosition();
    if (!pos) return;

    updateShapeProps(pos);
  };

  // onPointerUp 이벤트 핸들러도 외부 함수로 추출
  const handlePointerUp = () => {
    // 패닝 관련 처리
    if (isPanning) {
      // 패닝 모드의 마우스 좌표 초기화
      setLastPointerPosition(null);

      // 마우스 버튼을 떼면 패닝은 종료되지만, 스페이스가 여전히 눌려있다면
      // isPanning은 false가 되고 커서는 grab 상태 유지
      if (!isSpacePressed) {
        document.body.style.cursor = '';
      } else {
        document.body.style.cursor = 'grab';
      }
    }

    // 도형 그리기 완료 처리
    if (!curShapeProps) return;

    // Add the current shape to the list of shapes
    setShapes((prev) => [...prev, curShapeProps]);

    // Reset current shape and start position
    setStartPos(null);
    setCurShapeProps(null);
  };

  // Stage 컴포넌트에 추가적인 이벤트 핸들러
  const handlePointerLeave = () => {
    // 마우스가 Stage를 벗어나면 패닝 좌표 초기화
    // (마우스가 빠르게 움직여 mouseup 이벤트를 놓친 경우에 대한 안전장치)
    if (isPanning) {
      setLastPointerPosition(null);
    }
  };

  // Stage의 포인터 이벤트 처리 개선
  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // isPanning이 true일 때는 handleStageClick 실행하지 않고,
    // 대신 Stage의 패닝에 집중
    if (isPanning) {
      e.evt.preventDefault();
      e.evt.stopPropagation();

      // Stage 내에서 정확한 마우스 위치 설정
      const pointerPosition = stage?.getPointerPosition();
      if (pointerPosition) {
        setLastPointerPosition(pointerPosition);
      }
      return;
    }

    // 패닝 모드가 아니면 기존 클릭 핸들러 실행
    handleStageClick(e);
  };

  // 터치 이벤트용 별도 핸들러
  const handleStageTouchStart = (e: Konva.KonvaEventObject<TouchEvent>) => {
    // 패닝 중이면 터치 위치만 저장
    if (isPanning) {
      e.evt.preventDefault();

      const pointerPosition = stage?.getPointerPosition();
      if (pointerPosition) {
        setLastPointerPosition(pointerPosition);
      }
      return;
    }

    // 여기서는 일반 클릭 핸들러 그대로 사용
    // 터치 이벤트도 Konva가 처리해주기 때문에
    handleStageClick(e as any);
  };

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-[#1E1E1E] ${isSpacePressed ? 'cursor-grab' : ''}`}
      ref={containerRef}
    >
      {/* 상단 눈금자 (가로) */}
      <div className='absolute top-0 right-0 left-[20px] z-10 h-[20px]' style={{ backgroundColor: RULER_COLOR }}>
        <HorizontalRuler
          scale={scale}
          offset={getViewportOffset().x}
          width={Math.max(10, containerSize.width - RULER_SIZE)}
        />
      </div>

      {/* 좌측 눈금자 (세로) */}
      <div className='absolute top-[20px] bottom-0 left-0 z-10 w-[20px]' style={{ backgroundColor: RULER_COLOR }}>
        <VerticalRuler
          scale={scale}
          offset={getViewportOffset().y}
          height={Math.max(10, containerSize.height - RULER_SIZE)}
        />
      </div>

      {/* 좌상단 코너 (확대/축소 및 위치 초기화) */}
      <div
        className='absolute top-0 left-0 z-20 flex h-[20px] w-[20px] cursor-pointer items-center justify-center'
        style={{ backgroundColor: RULER_COLOR }}
        onClick={resetView}
      >
        <div className='h-2 w-2 rounded-full bg-gray-500'></div>
      </div>

      {/* 확대/축소 레벨 표시 */}
      <div className='absolute bottom-2 left-2 rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-70'>
        {Math.round(scale * 100)}%
      </div>

      {/* Stage는 컨테이너 크기가 유효한 경우에만 렌더링 */}
      {isInitialSizeMeasured && containerSize.width > 10 && containerSize.height > 10 && (
        <Stage
          width={containerSize.width - RULER_SIZE}
          height={containerSize.height - RULER_SIZE}
          ref={(_stage) => {
            if (initRef.current) return;
            setStage(_stage);
            initRef.current = true;
          }}
          draggable={false}
          scaleX={scale}
          scaleY={scale}
          onMouseDown={handleStageMouseDown}
          onTouchStart={handleStageTouchStart}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
          onPointerLeave={handlePointerLeave}
          style={{ marginTop: RULER_SIZE, marginLeft: RULER_SIZE }}
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
      )}
      <CanvasToolBar />
    </div>
  );
}
