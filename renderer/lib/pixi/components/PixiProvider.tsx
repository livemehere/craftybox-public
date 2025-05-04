import { useEffect, useState } from 'react';
import { Application } from 'pixi.js';

import { PixiContext } from '@/lib/pixi/PixiContext';

interface Props {
  children: React.ReactNode;
}

const PixiProvider = ({ children }: Props) => {
  const [app, setApp] = useState<Application | null>(null);
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);
  const [init, setInit] = useState(false);

  const _initialize = async () => {
    if (!canvasEl) return;
    const newApp = new Application();
    await newApp.init({
      canvas: canvasEl,
      resolution: window.devicePixelRatio > 1 ? 2 : 1,
    });
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
