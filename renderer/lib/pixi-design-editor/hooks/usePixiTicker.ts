import { useEffect } from 'react';
import { Application, Ticker } from 'pixi.js';
import { useCallbackRef } from '@fewings/react/hooks';

import { usePixi } from '@/lib/pixi-design-editor/PixiContext';

const seq = 0;
export function usePixiTicker(cb: (app: Application, ticker: Ticker) => void) {
  const { app } = usePixi();
  const _cb = useCallbackRef(cb);

  useEffect(() => {
    if (!app) return;
    const ticker = app.ticker.add((ticker) => {
      _cb(app, ticker);
    });
    // console.log(`add ticker handler ${++seq}`);
    return () => {
      ticker.destroy();
      // console.log(`remove ticker handler ${--seq}`);
    };
  }, [app]);
}
