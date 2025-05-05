import { Application } from 'pixi.js';
import { useEffect } from 'react';

import { usePixi } from '@/lib/pixi-design-editor/PixiContext';

let seq = 0;
export function usePixiEffect(
  cb: (app: Application) => (() => void) | void,
  deps: any[] = []
) {
  const { app } = usePixi();

  useEffect(() => {
    if (!app) return;
    const clear = cb(app);
    console.log(`call usePixiAppHook ${++seq}`);
    return () => {
      clear?.();
      console.log(`remove usePixiAppHook ${--seq}`);
    };
  }, [app, ...deps]);
}
