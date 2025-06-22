import { motion, useMotionValue } from 'motion/react';
import { RefObject, useImperativeHandle, useRef, useState } from 'react';

type Area = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type TControl = {
  reset: () => void;
};

type Props = {
  onChange: (area: Area) => void;
  controls: RefObject<TControl>;
  onChangeDone: (isDone: boolean) => void;
};

export const useAreaOverlayControls = () => {
  return useRef<TControl>({} as TControl);
};

const AreaOverlay = ({ onChange, controls, onChangeDone }: Props) => {
  const [isDone, setIsDone] = useState(false);
  const isDown = useRef(false);
  const startX = useMotionValue(0);
  const startY = useMotionValue(0);
  const endX = useMotionValue(0);
  const endY = useMotionValue(0);
  const leftTopX = useMotionValue(0);
  const leftTopY = useMotionValue(0);
  const width = useMotionValue(0);
  const height = useMotionValue(0);

  const setDone = (v: boolean) => {
    setIsDone(v);
    onChangeDone(v);
  };

  useImperativeHandle(controls, () => ({
    reset: () => {
      startX.set(0);
      startY.set(0);
      endX.set(0);
      endY.set(0);
      leftTopX.set(0);
      leftTopY.set(0);
      width.set(0);
      height.set(0);
      isDown.current = false;
      setDone(false);
    }
  }));

  return (
    <svg
      width='100%'
      height='100%'
      xmlns='http://www.w3.org/2000/svg'
      className={'absolute inset-0 z-10'}
      style={{
        pointerEvents: isDone ? 'none' : 'auto'
      }}
      onPointerDown={(e) => {
        if (isDone) return;
        startX.set(e.clientX);
        startY.set(e.clientY);
        isDown.current = true;
        onChange({
          x: startX.get(),
          y: startY.get(),
          width: 0,
          height: 0
        });
      }}
      onPointerUp={() => {
        isDown.current = false;
        setDone(true);
      }}
      onPointerMove={(e) => {
        if (!isDown.current) return;
        endX.set(e.clientX);
        endY.set(e.clientY);
        leftTopX.set(Math.min(startX.get(), endX.get()));
        leftTopY.set(Math.min(startY.get(), endY.get()));
        width.set(Math.abs(endX.get() - startX.get()));
        height.set(Math.abs(endY.get() - startY.get()));
        onChange({
          x: startX.get(),
          y: startY.get(),
          width: width.get(),
          height: height.get()
        });
      }}
    >
      <defs>
        <mask id='alphaMask'>
          <rect width='100%' height='100%' fill='white' />
          <motion.rect
            fill='black'
            style={{
              x: leftTopX,
              y: leftTopY,
              width: width,
              height: height
            }}
          />
        </mask>
      </defs>
      <motion.rect width='100%' height='100%' fill='black' opacity='0.5' mask='url(#alphaMask)' />
      <motion.rect
        fill='transparent'
        style={{
          x: leftTopX,
          y: leftTopY,
          width: width,
          height: height,
          outline: '2px solid white'
        }}
      />
    </svg>
  );
};

export default AreaOverlay;
