import { useEffect } from 'react';
import { Application, Ticker } from 'pixi.js';
import { useCallbackRef } from '@fewings/react/hooks';

import { usePixi } from '@/lib/pixi-core/PixiContext';

const seq = 0;
export function usePixiTicker(cb: (app: Application, ticker: Ticker) => void) {
  const { app } = usePixi();
  const _cb = useCallbackRef(cb);

  useEffect(() => {
    if (!app) return;
    const handler = (ticker: Ticker) => _cb(app, ticker);
    app.ticker.add(handler);
    return () => {
      app.ticker.remove(handler);
    };
  }, [app]);
}
