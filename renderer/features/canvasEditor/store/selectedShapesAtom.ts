import { atom } from 'jotai';
import { Shape } from 'konva/lib/Shape';

export const selectedShapesAtom = atom<Shape[]>([]);
