import { Application } from 'pixi.js';
import { useEffect } from 'react';

import { usePixi } from '@/lib/pixi-core/PixiContext';

const seq = 0;
export function usePixiEffect(
  cb: (app: Application) => (() => void) | void,
  deps: any[] = []
) {
  const { app } = usePixi();

  useEffect(() => {
    if (!app) return;
    const clear = cb(app);
    return () => {
      clear?.();
    };
  }, [app, ...deps]);
}
