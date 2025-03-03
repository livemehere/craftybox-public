export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished';
export interface ITimer {
  id: string;
  active: boolean;
  duration: number;
  timerRef: { current: number | undefined };
  startTimestampRef: { current: number | undefined };
  baseTimestampRef: { current: number | undefined };
  pauseTimestampRef: { current: number | undefined };
  endTimeStampRef: { current: number | undefined };
  status: TimerStatus;
}
