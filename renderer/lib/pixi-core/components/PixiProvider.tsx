import { useEffect, useRef, useState } from 'react';
import { Application } from 'pixi.js';

import { PixiContext } from '@/lib/pixi-core/PixiContext';

interface Props {
  children: React.ReactNode;
  resizeDeps?: any[];
}

const PixiProvider = ({ children, resizeDeps = [] }: Props) => {
  const [app, setApp] = useState<Application | null>(null);
  const appRef = useRef<Application | null>(null);
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);

  const createApp = async () => {
    if (!canvasEl) return;
    const newApp = new Application();
    await newApp.init({
      canvas: canvasEl,
      resolution: window.devicePixelRatio > 1 ? 2 : 1,
      resizeTo: canvasEl.parentElement!,
      background: '#141517',
    });
    newApp.stage.interactive = true;
    setApp(newApp);
    appRef.current = newApp;
    console.log('[2] Create pixi app');
    console.log(
      `[2] app.stage Size ${newApp.stage.width}x${newApp.stage.height}`
    );
    console.log(
      `[2] app.screen Size ${newApp.screen.width}x${newApp.screen.height}`
    );
  };

  /** Initialize the Pixi instance when a canvas element is found under the context */
  useEffect(() => {
    createApp().catch((err) => {
      console.error('[App] Error creating pixi app', err);
    });
  }, [canvasEl]);

  /** For cases where resizing is needed but not triggered by screen adjustments */
  useEffect(() => {
    if (!app) return;
    app.resize();
  }, [...resizeDeps]);

  useEffect(() => {
    return () => {
      setTimeout(() => {
        appRef.current?.destroy();
        appRef.current = null;
        console.log('[-] Destroy pixi app');
      }, 0);
    };
  }, []);

  return (
    <PixiContext.Provider
      value={{
        app,
        setCanvasEl,
      }}
    >
      {children}
    </PixiContext.Provider>
  );
};

export default PixiProvider;
