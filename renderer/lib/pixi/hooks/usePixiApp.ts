import { Application } from 'pixi.js';
import { useEffect } from 'react';
import { useCallbackRef } from '@fewings/react/hooks';

import { usePixi } from '@/lib/pixi/PixiContext';

let seq = 0;
export function usePixiApp(
  cb: (app: Application) => (() => void) | void,
  deps: any[] = []
) {
  const { app } = usePixi();
  const _cb = useCallbackRef(cb);

  useEffect(() => {
    if (!app) return;
    const clear = _cb(app);
    console.log(`call usePixiAppHook ${++seq}`);
    return () => {
      clear?.();
      console.log(`remove usePixiAppHook ${--seq}`);
    };
  }, [app, ...deps]);
}
