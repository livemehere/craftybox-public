import { atom } from 'jotai';
import { Container } from 'pixi.js';

export type EditMode = 'select' | 'move' | 'draw-rect';
export const hoverObjAtom = atom<Container | null>(null);
export const selectedObjAtom = atom<Container | null>(null);
export const rootContainerAtom = atom<Container | null>(null);
export const modeAtom = atom<EditMode>('select');
export const lockedContainerUidsAtom = atom<number[]>([]);
