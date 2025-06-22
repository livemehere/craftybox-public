import { useCallback, useEffect, useRef, useState } from 'react';
import { rendererIpc } from '@electron-buddy/ipc/renderer';
import { useHotkeys } from 'react-hotkeys-hook';
import { motion, useMotionValue } from 'motion/react';

import AreaOverlay, { useAreaOverlayControls } from './components/AreaOverlay';
import Tools, { TToggleKey, TToolKey } from './components/Tools';
import { useIsDragging } from './hooks/useIsDragging';
import { useCanvasEvents } from './hooks/useCanvasEvents';
import { mergeRef } from './utils/mergeRef';

import Stage from '@/lib/Canvas/Core/Stage';
import ImageLayer from '@/lib/Canvas/Core/Layer/Shapes/ImageLayer';
import useOn from '@/hooks/electron/useOn';
import Transform from '@/lib/Canvas/Core/Helper/Transform';
import { cn } from '@/utils/cn';

const DASH = [10, 5];
const LABEL_START = 1;
const INIT_TOOL_KEY = 'rect';
// 보색 효과를 위한 크로스헤어 커서 - mix-blend-mode: difference 효과
const crosshairCursor = `url("data:image/svg+xml,%3csvg width='24' height='24' xmlns='http://www.w3.org/2000/svg'%3e%3cg%3e%3cpath d='M12 2v20M2 12h20' stroke='white' stroke-width='2' fill='none'/%3e%3c/g%3e%3c/svg%3e") 12 12, crosshair`;

export const SnapshotApp = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<Stage>(undefined);
  const toolsRef = useRef<HTMLDivElement>(null);
  const isReset = useRef(false);
  const monitorPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const toolX = useMotionValue(0);
  const toolY = useMotionValue(0);
  const controls = useAreaOverlayControls();
  const [isDragging, dragRef] = useIsDragging();
  const [isAreaSelectDone, setIsAreaSelectDone] = useState(false);
  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });
  const [pixelRatio, setPixelRatio] = useState(1);

  const [activeToolKey, setActiveToolKey] = useState<TToolKey>(INIT_TOOL_KEY);
  const [toggleKeys, setToggleKeys] = useState<TToggleKey[]>([]);
  const [color, setColor] = useState('#ff0000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fontSize, setFontSize] = useState(16);
  const [curLabelNumber, setCurLabelNumber] = useState(LABEL_START);

  const createPin = async () => {
    const stage = stageRef.current;
    if (!stage) {
      throw new Error('stage is not initialized');
    }

    const base64 = await stage.toBase64({
      crop: {
        x: crop.x * pixelRatio,
        y: crop.y * pixelRatio,
        width: crop.width * pixelRatio,
        height: crop.height * pixelRatio
      }
    });
    await rendererIpc.invoke('window:createPin', {
      x: monitorPosRef.current.x + parseInt(crop.x.toString()),
      y: monitorPosRef.current.y + parseInt(crop.y.toString()),
      width: parseInt(crop.width.toString()),
      height: parseInt(crop.height.toString()),
      base64
    });
    await rendererIpc.invoke('window:hide', 'snapshot');
  };

  const copyToClipboard = async () => {
    const stage = stageRef.current;
    if (!stage) {
      throw new Error('stage is not initialized');
    }

    await stage.copyToClipboard({
      crop: {
        x: crop.x * pixelRatio,
        y: crop.y * pixelRatio,
        width: crop.width * pixelRatio,
        height: crop.height * pixelRatio
      }
    });
    await rendererIpc.invoke('window:hide', 'snapshot');
  };

  const reset = useCallback(() => {
    // keep color, strokeWidth, fontSize
    if (isReset.current) return;
    controls.current.reset();
    stageRef.current?.destroy();
    stageRef.current = undefined;
    setActiveToolKey(INIT_TOOL_KEY);
    setToggleKeys([]);
    setCurLabelNumber(LABEL_START);
    isReset.current = true;

    toolX.set(0);
    toolY.set(0);
  }, [controls]);

  const resetCanvas = () => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.root.children.forEach((layer) => {
      if (!layer.hasTag('screen')) {
        layer.destroy();
      }
    });
    setCurLabelNumber(1);
    stage.render();
  };

  useHotkeys('mod+c', () => copyToClipboard());
  useOn('snapshot:reset', () => {
    reset();
  });
  useOn('snapshot:get', (e) => {
    reset();
    const canvas = canvasRef.current!;
    const stage = new Stage({
      canvas,
      backgroundColor: '#fff',
      interactable: true,
      pixelRatio: e.scaleFactor
    });
    stageRef.current = stage;
    setPixelRatio(e.scaleFactor);

    const screenImg = new ImageLayer({
      src: e.base64,
      tags: ['screen'],
      width: e.width,
      height: e.height
    });
    stage.root.addChild(screenImg as any);
    stage.render();
    isReset.current = false;
    monitorPosRef.current = { x: e.x, y: e.y };
  });

  const allDraggable = () => {
    const stage = stageRef.current;
    if (!stage) {
      throw new Error('stage is not initialized');
    }
    const offs: (() => void)[] = [];

    stage.root.children.forEach((layer) => {
      if (!layer.hasTag('screen')) {
        const off = Transform.draggable(stage, layer);
        offs.push(off);
      }
    });
    return offs;
  };

  // Tool box position to inner if it is out of screen
  useEffect(() => {
    if (isAreaSelectDone) {
      const rect = toolsRef.current!.getBoundingClientRect();
      const bottomRemainHeight = window.innerHeight - crop.y - crop.height;
      const canShow = bottomRemainHeight > rect.height;
      if (canShow) {
        toolY.set(0);
      } else {
        toolY.set(-rect!.height - 10);
        toolX.set(-10);
      }
    }
  }, [isAreaSelectDone]);

  // Canvas 이벤트 처리를 커스텀 훅으로 분리
  useCanvasEvents({
    stage: stageRef.current,
    activeToolKey,
    strokeWidth,
    color,
    toggleKeys,
    fontSize,
    curLabelNumber,
    setActiveToolKey,
    setCurLabelNumber,
    allDraggable,
    dash: DASH
  });

  return (
    <main
      className={'h-screen w-screen bg-transparent'}
      style={{
        cursor: isAreaSelectDone ? 'default' : crosshairCursor
      }}
    >
      <AreaOverlay onChange={setCrop} controls={controls} onChangeDone={setIsAreaSelectDone} />
      <motion.div
        ref={toolsRef}
        drag
        dragMomentum={false}
        className={cn('absolute z-10', {
          'pointer-events-none opacity-15': isDragging
        })}
        style={{
          top: `${crop.y + crop.height}px`,
          right: `calc(100% - ${crop.x + crop.width}px)`,
          display: `${isAreaSelectDone ? 'block' : 'none'}`,
          x: toolX,
          y: toolY
        }}
        whileTap={{ scale: 0.99 }}
      >
        <Tools
          activeKey={activeToolKey}
          setActiveKey={setActiveToolKey}
          activeToggleKeys={toggleKeys}
          setActiveToggleKeys={setToggleKeys}
          color={color}
          setColor={setColor}
          strokeWidth={activeToolKey === 'text' ? fontSize : strokeWidth}
          setStrokeWidth={activeToolKey === 'text' ? setFontSize : setStrokeWidth}
          resetChildren={resetCanvas}
          createPin={createPin}
        />
      </motion.div>
      <canvas className={'fixed inset-0 z-[2] h-screen w-screen'} ref={mergeRef(canvasRef, dragRef)} />
    </main>
  );
};
