import { uid } from 'uid';

import { ITimer } from '@/features/timer/types';

export const createTimer = (duration = 0, active = false): ITimer => {
  return {
    id: uid(8),
    active,
    duration,
    timerRef: { current: undefined },
    startTimestampRef: { current: undefined },
    baseTimestampRef: { current: undefined },
    pauseTimestampRef: { current: undefined },
    endTimeStampRef: { current: undefined },
    status: 'idle'
  };
};

export const resetTimer = (timer: ITimer): ITimer => {
  return {
    ...timer,
    status: 'idle',
    active: false,
    timerRef: { current: undefined },
    startTimestampRef: { current: undefined },
    baseTimestampRef: { current: undefined },
    pauseTimestampRef: { current: undefined },
    endTimeStampRef: { current: undefined }
  };
};
