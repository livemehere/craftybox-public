import { atom } from 'jotai';
import { focusAtom } from 'jotai-optics';

import { atomWithLocalStorage } from '@/stores/utils/atomWithLocalStorage';
import { ITimer } from '@/features/timer/types';
import { createTimer, resetTimer } from '@/features/timer/utils';

export const timersAtom = atomWithLocalStorage<ITimer[]>('timers', []);
timersAtom.debugLabel = 'timers';
timersAtom.onMount = (setAtom) => {
  setAtom((prev) => prev.map(resetTimer));
};

/* setters */
export const removeAllTimersAtom = atom(null, (get, set) => {
  const timers = get(timersAtom);
  timers.forEach((timer) => {
    set(removeTimerAtom, timer.id);
  });
});

export const addTimerAtom = atom(null, (get, set, duration: number = 0) => {
  const timer = createTimer(duration);
  set(timersAtom, (prev) => {
    const next = [...prev, timer];
    return next;
  });
  set(setActiveTimerAtom, timer.id);
});

export const removeTimerAtom = atom(null, (get, set, id: string) => {
  set(timersAtom, (prev) => {
    const next = prev.filter((timer) => {
      if (timer.id === id) {
        window.clearInterval(timer.timerRef.current);
        return false;
      }
      return true;
    });
    return next;
  });
});

export const setActiveTimerAtom = atom(null, (get, set, id: string) => {
  set(timersAtom, (prev) => {
    const next = prev.map((timer) => {
      return {
        ...timer,
        active: timer.id === id
      };
    });
    return next;
  });
});

export const setDurationAtom = atom(null, (get, set, { id, duration }: { id: string; duration: number }) => {
  set(timersAtom, (prev) => {
    const next = prev.map((timer) => {
      return {
        ...timer,
        duration: timer.id === id ? duration : timer.duration
      };
    });
    return next;
  });
});

/* --- */

/* active timer atom */
export const activeTimerAtom = focusAtom(timersAtom, (o) => o.find((timer) => timer.active));
activeTimerAtom.debugLabel = 'activeTimer';
