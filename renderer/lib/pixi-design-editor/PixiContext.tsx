import { createContext, useContext } from 'react';
import { Application } from 'pixi.js';

interface PixiContextValue {
  app: Application | null;
  setCanvasEl: (el: HTMLCanvasElement) => void;
  init: boolean;
}

export const PixiContext = createContext<PixiContextValue>({
  app: null,
  setCanvasEl: () => {},
  init: false,
});

export const usePixi = () => useContext(PixiContext);
