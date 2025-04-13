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
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const width = useMotionValue(0);
  const height = useMotionValue(0);

  const setDone = (v: boolean) => {
    setIsDone(v);
    onChangeDone(v);
  };

  useImperativeHandle(controls, () => ({
    reset: () => {
      x.set(0);
      y.set(0);
      width.set(0);
      height.set(0);
      isDown.current = false;
      setDone(false);
    },
  }));

  return (
    <svg
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      className={'absolute inset-0 z-10'}
      style={{
        pointerEvents: isDone ? 'none' : 'auto',
      }}
      onPointerDown={(e) => {
        if (isDone) return;
        x.set(e.clientX);
        y.set(e.clientY);
        isDown.current = true;
        onChange({
          x: x.get(),
          y: y.get(),
          width: 0,
          height: 0,
        });
      }}
      onPointerUp={() => {
        isDown.current = false;
        setDone(true);
      }}
      onPointerMove={(e) => {
        if (!isDown.current) return;
        width.set(e.clientX - x.get());
        height.set(e.clientY - y.get());
        onChange({
          x: x.get(),
          y: y.get(),
          width: width.get(),
          height: height.get(),
        });
      }}
    >
      <defs>
        <mask id="alphaMask">
          <rect width="100%" height="100%" fill="white" />
          <motion.rect
            fill="black"
            style={{
              x,
              y,
              width,
              height,
            }}
          />
        </mask>
      </defs>
      <motion.rect
        width="100%"
        height="100%"
        fill="black"
        opacity="0.5"
        mask="url(#alphaMask)"
      />
      <motion.rect
        fill="transparent"
        style={{
          x,
          y,
          width,
          height,
          outline: '2px solid white',
        }}
      />
    </svg>
  );
};

export default AreaOverlay;
