import { useRef } from 'react';

import { usePixi } from '@/lib/pixi/PixiContext';

const PixiCanvas = () => {
  const { setCanvasEl, init } = usePixi();
  const initRef = useRef(false);
  return (
    <canvas
      ref={(el) => {
        if (!el || init || initRef.current) return;
        setCanvasEl(el);
        initRef.current = true;
        console.log('set canvas el');
      }}
      className={'h-full w-full'}
    ></canvas>
  );
};

export default PixiCanvas;
