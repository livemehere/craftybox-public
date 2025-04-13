import { useAtom } from 'jotai/index';
import { rendererIpc } from '@electron-buddy/ipc/renderer';
import { createContext } from '@fewings/react/contextSelector';

import { activeTimerAtom } from '@/features/timer/stores/timersAtom';
import { useTimer } from '@/features/timer/hooks/useTimer';

interface Props {
  children: React.ReactNode;
}

export const TimerContext = createContext({
  onClickActionButton: () => {},
  isPlayable: false,
  progress: 0,
  remain: 0,
  duration: 0,
  formatTime: (v: number) => `${v}`,
  reset: () => {},
});

const TimerProvider = ({ children }: Props) => {
  const [timer, setTimer] = useAtom(activeTimerAtom);

  const {
    progress,
    duration,
    remain,
    isRunning,
    isPaused,
    start,
    pause,
    reset,
    resume,
    formatTime,
  } = useTimer({
    onEnd: () => {
      notify();
      setTimer((prev) => ({ ...prev, status: 'finished', progress: 1 }));
    },
    onStart: () => {
      setTimer((prev) => ({ ...prev, status: 'running' }));
    },
    onPause: () => {
      setTimer((prev) => ({ ...prev, status: 'paused' }));
    },
    onResume: () => {
      setTimer((prev) => ({ ...prev, status: 'running' }));
    },
    onReset: () => {
      setTimer((prev) => ({ ...prev, status: 'idle' }));
    },
    resumeUnfinishedTimer: true,
    clearTimerOnUnmount: false,
    duration: timer?.duration,
    onChangeDuration: (v) => {
      setTimer((prev) => ({
        ...prev,
        duration: v,
      }));
    },
    timerRef: timer?.timerRef,
    startTimestampRef: timer?.startTimestampRef,
    baseTimestampRef: timer?.baseTimestampRef,
    pauseTimestampRef: timer?.pauseTimestampRef,
    endTimeStampRef: timer?.endTimeStampRef,
  });

  const notify = () => {
    new window.Notification('타이머 종료 알림', {
      body: `${formatTime(duration)} 타이머가 종료되었습니다.`,
    }).onclick = () => {
      rendererIpc.invoke('window:showMain', null);
    };
  };

  const onClickActionButton = () => {
    if (!isRunning) {
      return start();
    }
    if (isPaused) {
      return resume();
    } else {
      return pause();
    }
  };
  const isPlayable = !isRunning || isPaused;

  return (
    <TimerContext.Provider
      value={{
        onClickActionButton,
        isPlayable,
        progress,
        remain,
        duration,
        formatTime,
        reset,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export default TimerProvider;
