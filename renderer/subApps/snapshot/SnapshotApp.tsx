import { useCallback, useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { motion, useMotionValue } from 'motion/react';
import { setupCanvasSize } from 'renderer/lib/simple-canvas-utils';

import useOn from '@/hooks/electron/useOn';
import { drawImg } from '@/lib/simple-canvas-utils/draw/img';
import { convertPointer } from '@/lib/simple-canvas-utils/pointer';

import Tools, { TToggleKey, TToolKey } from './components/Tools';
import AreaOverlay, { useAreaOverlayControls } from './components/AreaOverlay';

const DASH = [10, 5];
const LABEL_START = 1;

export const SnapshotApp = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const monitorPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const toolX = useMotionValue(0);
  const toolY = useMotionValue(0);
  const controls = useAreaOverlayControls();
  const [isAreaSelectDone, setIsAreaSelectDone] = useState(false);
  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [scaleFactor, setScaleFactor] = useState(1);

  const [activeToolKey, setActiveToolKey] = useState<TToolKey>('select');
  const [toggleKeys, setToggleKeys] = useState<TToggleKey[]>([]);
  const [color, setColor] = useState('#ff0000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fontSize, setFontSize] = useState(16);
  const [curLabelNumber, setCurLabelNumber] = useState(LABEL_START);

  const createPin = async () => {
    // const stage = canvasRef.current;
    // if (!stage) {
    //   throw new Error('stage is not initialized');
    // }
    //
    // const base64 = await stage.toBase64({
    //   crop: {
    //     x: crop.x * pixelRatio,
    //     y: crop.y * pixelRatio,
    //     width: crop.width * pixelRatio,
    //     height: crop.height * pixelRatio,
    //   },
    // });
    // await rendererIpc.invoke('window:createPin', {
    //   x: monitorPosRef.current.x + parseInt(crop.x.toString()),
    //   y: monitorPosRef.current.y + parseInt(crop.y.toString()),
    //   width: parseInt(crop.width.toString()),
    //   height: parseInt(crop.height.toString()),
    //   base64,
    // });
    // await rendererIpc.invoke('window:hide', 'snapshot');
  };

  const copyToClipboard = async () => {
    // const stage = canvasRef.current;
    // if (!stage) {
    //   throw new Error('stage is not initialized');
    // }
    //
    // await stage.copyToClipboard({
    //   crop: {
    //     x: crop.x * pixelRatio,
    //     y: crop.y * pixelRatio,
    //     width: crop.width * pixelRatio,
    //     height: crop.height * pixelRatio,
    //   },
    // });
    // await rendererIpc.invoke('window:hide', 'snapshot');
  };

  const reset = useCallback(() => {
    // keep color, strokeWidth, fontSize
    controls.current.reset();
    // stageRef.current?.destroy();
    // stageRef.current = undefined;
    setActiveToolKey('select');
    setToggleKeys([]);
    setCurLabelNumber(LABEL_START);
    //
    toolX.set(0);
    toolY.set(0);
  }, [controls]);

  const resetDrawing = () => {
    // const stage = stageRef.current;
    // if (!stage) return;
    // stage.root.children.forEach((layer) => {
    //   if (!layer.hasTag('screen')) {
    //     layer.destroy();
    //   }
    // });
    // setCurLabelNumber(1);
    // stage.render();
  };

  useHotkeys('mod+c', () => copyToClipboard());
  useOn('snapshot:reset', () => {
    reset();
  });
  useOn('snapshot:get', async (e) => {
    reset();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    setupCanvasSize(canvas, e.width, e.height, e.scaleFactor);
    setScaleFactor(e.scaleFactor);
    await drawImg(ctx, e.base64, {
      width: e.width * e.scaleFactor,
      height: e.height * e.scaleFactor,
      x: 0,
      y: 0,
    });
    //
    // const crop = cropCanvas(canvas, e.width, e.height, e.scaleFactor, {
    //   x: 0,
    //   y: 0,
    //   width: 200,
    //   height: 200,
    // });
    //
    // await drawImg(ctx, crop.toDataURL(), {
    //   x: 300,
    //   y: 300,
    //   width: crop.width,
    //   height: crop.height,
    // });
  });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    const onPointerDown = (e: PointerEvent) => {
      const x = convertPointer(e.clientX, scaleFactor);
      const y = convertPointer(e.clientY, scaleFactor);
      ctx.rect(x, y, 10, 10);
      ctx.fillStyle = 'red';
      ctx.fill();
    };

    canvas.addEventListener('pointerdown', onPointerDown);

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
    };
  }, [scaleFactor]);

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

  return (
    <main
      className={'h-screen w-screen bg-transparent'}
      style={{
        cursor: isAreaSelectDone ? 'default' : 'crosshair',
      }}
    >
      <AreaOverlay
        onChange={setCrop}
        controls={controls}
        onChangeDone={setIsAreaSelectDone}
      />
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
          y: toolY,
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
          setStrokeWidth={
            activeToolKey === 'text' ? setFontSize : setStrokeWidth
          }
          resetChildren={resetDrawing}
          createPin={createPin}
        />
      </motion.div>
      <canvas className={'fixed inset-0 z-[2]'} ref={canvasRef}></canvas>
    </main>
  );
};
