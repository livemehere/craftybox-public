import { RefObject, useEffect } from 'react';
import { secondToTime } from '@fewings/core/converter';
import { useCallbackRef, useControlledState, useForceUpdate } from '@fewings/react/hooks';

import useControlledRef from '@/hooks/useControlledRef';

type Options = {
  onEnd?: () => void;
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onReset?: () => void;
  onUpdate?: () => void;
  checkInterval?: number;

  /**
   * Automatically resumes the timer if it wasn't finished when the component remounts.
   * Useful when working with controlled state or refs to maintain timer continuity.
   */
  resumeUnfinishedTimer?: boolean;
  clearTimerOnUnmount?: boolean;

  /* for controlled state */
  defaultDuration?: number;
  duration?: number;
  onChangeDuration?: (v: number) => void;
  timerRef?: RefObject<number | undefined>;
  startTimestampRef?: RefObject<number | undefined>;
  baseTimestampRef?: RefObject<number | undefined>;
  pauseTimestampRef?: RefObject<number | undefined>;
  endTimeStampRef?: RefObject<number | undefined>;
};

/**
 * time is seconds
 */
export const useTimer = ({
  onEnd,
  onStart,
  onPause,
  onResume,
  onReset,
  onUpdate,
  checkInterval = 500,
  resumeUnfinishedTimer = false,
  clearTimerOnUnmount = true,
  /* states */
  defaultDuration,
  duration: _duration,
  onChangeDuration,
  /* refs */
  timerRef: _timerRef,
  startTimestampRef: _startTimestampRef,
  baseTimestampRef: _baseTimestampRef,
  pauseTimestampRef: _pauseTimestampRef,
  endTimeStampRef: _endTimeStampRef
}: Options = {}) => {
  const update = useForceUpdate();

  const onEndCb = useCallbackRef(onEnd);
  const onStartCb = useCallbackRef(onStart);
  const onPauseCb = useCallbackRef(onPause);
  const onResumeCb = useCallbackRef(onResume);
  const onResetCb = useCallbackRef(onReset);
  const onUpdateCb = useCallbackRef(onUpdate);

  const timerRef = useControlledRef(_timerRef);
  const startTimestampRef = useControlledRef(_startTimestampRef);
  const baseTimestampRef = useControlledRef(_baseTimestampRef);
  const pauseTimestampRef = useControlledRef(_pauseTimestampRef);
  const endTimeStampRef = useControlledRef(_endTimeStampRef);

  const [duration = 0, setDuration] = useControlledState({
    defaultValue: defaultDuration || 0,
    value: _duration,
    onChange: onChangeDuration
  });

  const isRunning = !!baseTimestampRef.current;
  const isPaused = !!pauseTimestampRef.current;

  const calcDiff = () => {
    return Math.floor((baseTimestampRef.current ? Date.now() - baseTimestampRef.current : 0) / 1000);
  };

  const diff = calcDiff();
  const progress = duration > 0 ? diff / duration : 0;
  const remain = duration - diff;

  const clearTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = undefined;
    update();
  };

  const check = () => {
    const remain = duration - calcDiff();
    if (remain <= 0) {
      clearTimer();
      baseTimestampRef.current = undefined; // Clear start timestamp
      pauseTimestampRef.current = undefined; // Clear pause timestamp
      endTimeStampRef.current = Date.now();
      onEndCb();
    } else {
      onUpdateCb();
    }
    update();
  };

  const startTimer = () => {
    clearTimer();
    timerRef.current = window.setInterval(() => check(), checkInterval);
  };

  const start = () => {
    if (duration <= 0) return;

    const now = Date.now();
    startTimestampRef.current = now;
    baseTimestampRef.current = now;
    startTimer();
    onStartCb();
    update();
  };

  const pause = () => {
    if (pauseTimestampRef.current) return; // Already paused
    if (!startTimestampRef.current) return; // Not started yet

    clearTimer();
    pauseTimestampRef.current = Date.now(); // Record pause time
    onPauseCb();
    update();
  };

  const resume = () => {
    if (!pauseTimestampRef.current) return;
    if (!baseTimestampRef.current) return;

    const pausedDuration = Date.now() - pauseTimestampRef.current;
    baseTimestampRef.current += pausedDuration;
    pauseTimestampRef.current = undefined;
    startTimer();
    onResumeCb();
    update();
  };

  const reset = () => {
    clearTimer();
    pauseTimestampRef.current = undefined; // Clear pause timestamp
    baseTimestampRef.current = undefined; // Clear start timestamp
    startTimestampRef.current = undefined;
    endTimeStampRef.current = undefined;
    onResetCb();
    update();
  };

  const formatTime = (v: number) => {
    const isOverHour = v >= 3600;
    if (isOverHour) {
      const { h, m, s } = secondToTime(v, 'h');
      const hour = `${h}`.padStart(2, '0');
      const min = `${m}`.padStart(2, '0');
      const sec = `${s}`.padStart(2, '0');
      return `${hour}:${min}:${sec}`;
    }
    const { m, s } = secondToTime(v, 'm');
    const min = `${m}`.padStart(2, '0');
    const sec = `${s}`.padStart(2, '0');
    return `${min}:${sec}`;
  };

  useEffect(() => {
    if (resumeUnfinishedTimer && baseTimestampRef.current && !endTimeStampRef.current) {
      if (remain <= 0) {
        reset();
      } else {
        startTimer();
        onResumeCb();
      }
    }
    update();
  }, [resumeUnfinishedTimer]);

  useEffect(() => {
    return () => {
      if (clearTimerOnUnmount) {
        clearTimer();
      }
    };
  }, [clearTimerOnUnmount]);

  return {
    /* method */
    start,
    pause,
    resume,
    reset,
    formatTime,
    startTimer,
    /* state */
    duration,
    setDuration,
    progress,
    remain,
    isRunning,
    isPaused
  };
};
