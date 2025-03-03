import { useCallback, useEffect, useRef, useState } from 'react';
import { rendererIpc } from '@electron-buddy/ipc/renderer';
import { useHotkeys } from 'react-hotkeys-hook';
import { motion, useMotionValue } from 'motion/react';

import AreaOverlay, { useAreaOverlayControls } from './components/AreaOverlay';
import Tools, { TToggleKey, TToolKey } from './components/Tools';

import Stage from '@/lib/Canvas/Core/Stage';
import ImageLayer from '@/lib/Canvas/Core/Layer/Shapes/ImageLayer';
import useOn from '@/hooks/electron/useOn';
import InteractionLayer from '@/lib/Canvas/Core/Layer/Core/InteractionLayer';
import RectLayer from '@/lib/Canvas/Core/Layer/Shapes/RectLayer';
import ArrowLayer from '@/lib/Canvas/Core/Layer/Shapes/ArrowLayer';
import Layer from '@/lib/Canvas/Core/Layer/Core/Layer';
import LineLayer from '@/lib/Canvas/Core/Layer/Shapes/LineLayer';
import { EllipseLayer } from '@/lib/Canvas/Core/Layer/Shapes/EllipseLayer';
import TextLayer from '@/lib/Canvas/Core/Layer/Shapes/TextLayer';
import Transform from '@/lib/Canvas/Core/Helper/Transform';
import FrameLayer from '@/lib/Canvas/Core/Layer/Container/FrameLayer';

const DASH = [10, 5];
const LABEL_START = 1;

export const SnapshotApp = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<Stage>(undefined);
  const toolsRef = useRef<HTMLDivElement>(null);
  const isReset = useRef(false);
  const monitorPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const toolX = useMotionValue(0);
  const toolY = useMotionValue(0);
  const controls = useAreaOverlayControls();
  const [isAreaSelectDone, setIsAreaSelectDone] = useState(false);
  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });
  const [pixelRatio, setPixelRatio] = useState(1);

  const [activeToolKey, setActiveToolKey] = useState<TToolKey>('select');
  const [toggleKeys, setToggleKeys] = useState<TToggleKey[]>([]);
  const [color, setColor] = useState('#ff0000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fontSize, setFontSize] = useState(16);
  const [curLabelNumber, setCurLabelNumber] = useState(LABEL_START);

  const historyRef = useRef<string[]>([]);
  const offListenersRef = useRef<(() => void)[]>([]);

  const pushHistory = () => {
    // TODO
  };

  const undo = async () => {
    // TODO
  };

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
    setActiveToolKey('select');
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

  useHotkeys('mod+z', () => undo());
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
    stage.root.addChild(screenImg);
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

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    if (activeToolKey === 'select') {
      offListenersRef.current = allDraggable();
    } else {
      offListenersRef.current?.forEach((off) => off());
    }

    let layer: InteractionLayer | null = null;
    const downOff = stage.on('pointerdown', (e) => {
      const strokes = {
        strokeWidth,
        strokeStyle: color,
        dash: toggleKeys.includes('dash') ? DASH : undefined
      };
      const fills = {
        fillStyle: color
      };
      const linePos = {
        x1: e.pointerX,
        y1: e.pointerY,
        x2: e.pointerX,
        y2: e.pointerY
      };
      const boxPos = {
        x: e.pointerX,
        y: e.pointerY
      };

      switch (activeToolKey) {
        case 'select':
          break;
        case 'rect':
          layer = new RectLayer({
            ...boxPos,
            ...strokes
          });
          break;
        case 'ellipse':
          layer = new EllipseLayer({
            ...boxPos,
            ...strokes
          });
          break;
        case 'arrow':
          layer = new ArrowLayer({
            ...linePos,
            ...strokes
          });
          break;
        case 'line':
          layer = new LineLayer({
            ...linePos,
            ...strokes
          });
          break;
        case 'text':
          {
            layer = new TextLayer({
              ...boxPos,
              ...fills,
              text: '',
              strokeWidth: 0,
              fontSize
            });
            const off = Transform.textEditable(stage, layer as TextLayer, {
              onBlur: () => {
                off();
                setActiveToolKey('select');
              }
            });
          }
          break;
        case 'label':
          {
            const group = new FrameLayer({
              ...boxPos,
              width: 20,
              height: 20
            });
            group.x -= group.width / 2;
            group.y -= group.height / 2;
            const count = new TextLayer({
              text: `${curLabelNumber}`,
              fontSize: 14,
              fillStyle: '#fff',
              strokeWidth: 0
            });
            stage.measureAndUpdateTextLayer(count);
            count.x = group.width / 2 - count.width / 2;
            count.y = group.height / 2 - count.height / 2;
            const bg = new EllipseLayer({
              width: group.width,
              height: group.height,
              ...fills
            });
            group.addChild(bg);
            group.addChild(count);
            group.addTag('label');
            layer = group;
            setCurLabelNumber((prev) => prev + 1);
          }
          break;
        default:
          throw new Error('invalid tool key');
      }
      if (layer) {
        stage.root.addChild(layer);
        stage.render();
      }
    });

    const moveOff = stage.on('pointermove', (e) => {
      if (!layer) return;
      if (Layer.isLineLayer(layer)) {
        layer.x2 = e.pointerX;
        layer.y2 = e.pointerY;
      } else {
        layer.width = e.pointerX - layer.x;
        layer.height = e.pointerY - layer.y;
      }
      stage.render();
    });

    const upOff = stage.on('pointerup', () => {
      layer = null;
    });

    return () => {
      downOff();
      moveOff();
      upOff();
    };
  }, [activeToolKey, toggleKeys, color, strokeWidth, fontSize, curLabelNumber]);

  return (
    <main
      className={'h-screen w-screen bg-transparent'}
      style={{
        cursor: isAreaSelectDone ? 'default' : 'crosshair'
      }}
    >
      <AreaOverlay onChange={setCrop} controls={controls} onChangeDone={setIsAreaSelectDone} />
      <motion.div
        ref={toolsRef}
        drag
        dragMomentum={false}
        className={'absolute z-10'}
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
      <canvas className={'fixed inset-0 z-[2] h-screen w-screen'} ref={canvasRef}></canvas>
    </main>
  );
};
