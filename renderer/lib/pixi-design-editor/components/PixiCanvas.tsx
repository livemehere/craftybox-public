import { useRef } from 'react';

import { usePixi } from '@/lib/pixi-design-editor/PixiContext';

const PixiCanvas = () => {
  const { setCanvasEl } = usePixi();
  const initRef = useRef(false);
  return (
    <div className={'h-full w-full'}>
      <canvas
        ref={(el) => {
          if (!el || initRef.current) return;
          setCanvasEl(el);
          initRef.current = true;
          console.log('[1] Set canvas element');
        }}
        className={'h-full w-full'}
      ></canvas>
    </div>
  );
};

export default PixiCanvas;
