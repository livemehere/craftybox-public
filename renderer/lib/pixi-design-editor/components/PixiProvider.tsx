import { useEffect, useState } from 'react';
import { Application } from 'pixi.js';

import { PixiContext } from '@/lib/pixi-design-editor/PixiContext';

interface Props {
  children: React.ReactNode;
  resizeDeps?: any[];
}

const PixiProvider = ({ children, resizeDeps = [] }: Props) => {
  const [app, setApp] = useState<Application | null>(null);
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);
  const [init, setInit] = useState(false);

  const _initialize = async () => {
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
    setInit(true);
    console.log('init pixi app');
  };

  useEffect(() => {
    _initialize();

    return () => {
      if (app) {
        app.destroy();
        setApp(null);
        console.log('destroy pixi app');
      }
    };
  }, [canvasEl]);

  useEffect(() => {
    if (!app) return;
    app.resize();
  }, [...resizeDeps]);

  return (
    <PixiContext.Provider
      value={{
        app,
        setCanvasEl,
        init,
      }}
    >
      {children}
    </PixiContext.Provider>
  );
};

export default PixiProvider;
