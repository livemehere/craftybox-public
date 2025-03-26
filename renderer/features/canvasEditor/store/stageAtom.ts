import { atom } from 'jotai';
import Konva from 'konva';

export const stageAtom = atom<Konva.Stage | null>(null);
stageAtom.debugLabel = 'stageAtom';
