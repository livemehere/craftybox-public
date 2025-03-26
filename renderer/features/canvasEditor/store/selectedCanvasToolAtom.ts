import { atom } from 'jotai';

import { TCanvasTool } from '../components/CanvasToolBar';

export const selectedCanvasToolAtom = atom<TCanvasTool>('pointer');
selectedCanvasToolAtom.debugLabel = 'selectedCanvasToolAtom';
