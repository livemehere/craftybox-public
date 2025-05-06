import { createContext, useContext } from 'react';
import { Application } from 'pixi.js';

interface PixiContextValue {
  app: Application | null;
  setCanvasEl: (el: HTMLCanvasElement) => void;
}

export const PixiContext = createContext<PixiContextValue>({
  app: null,
  setCanvasEl: () => {},
});

export const usePixi = () => useContext(PixiContext);
