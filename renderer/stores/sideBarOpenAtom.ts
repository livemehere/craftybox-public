import { atomWithLocalStorage } from '@/stores/utils/atomWithLocalStorage';

export const sideBarOpenAtom = atomWithLocalStorage('sideBarOpen', true);
sideBarOpenAtom.debugLabel = 'sideBarOpen';
