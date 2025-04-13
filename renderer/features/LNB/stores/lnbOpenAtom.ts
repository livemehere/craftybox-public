import { atomWithLocalStorage } from '@/stores/utils/atomWithLocalStorage';

export const lnbOpenAtom = atomWithLocalStorage('lnbOpen', true);
lnbOpenAtom.debugLabel = 'lnbOpen';
