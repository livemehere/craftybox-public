import { atom } from 'jotai';
import { Container } from 'pixi.js';

export type EditMode = 'select' | 'move' | 'draw-rect';
export const hoverObjAtom = atom<Container | null>(null);
export const selectedObjAtom = atom<Container | null>(null);
export const exportContainerAtom = atom<Container | null>(null);
export const modeAtom = atom<EditMode>('select');
