import { useEffect } from 'react';
import { Application, Ticker, TickerCallback } from 'pixi.js';
import { useCallbackRef } from '@fewings/react/hooks';

import { usePixi } from '@/lib/pixi/PixiContext';

let seq = 0;
export function usePixiTicker(cb: (app: Application, ticker: Ticker) => void) {
  const { app } = usePixi();
  const _cb = useCallbackRef(cb);

  useEffect(() => {
    if (!app) return;
    const handler: TickerCallback<any> = (ticker) => {
      _cb(app, ticker);
    };
    app.ticker.add(handler);
    console.log(`add ticker handler ${++seq}`);
    return () => {
      app?.ticker?.remove(handler);
      console.log(`remove ticker handler ${--seq}`);
    };
  }, [app]);
}
