import { useAtomValue } from 'jotai';
import { Space } from '@fewings/react/components';
import { AnimateNumber } from '@fewings/fancy-react/AnimateNumber';
import { FaPause, FaPlay } from 'react-icons/fa6';
import { GrPowerReset } from 'react-icons/gr';
import { useContextSelector } from '@fewings/react/contextSelector';

import { activeTimerAtom } from '@/features/timer/stores/timersAtom';
import ProgressCircle from '@/features/timer/components/ProgressCircle';
import { cn } from '@/utils/cn';
import { TimerContext } from '@/features/timer/TimerProvider';

const ActiveTimer = () => {
  const timer = useAtomValue(activeTimerAtom);
  const progress = useContextSelector(TimerContext, (v) => v.progress);
  const isPlayable = useContextSelector(TimerContext, (v) => v.isPlayable);
  const remain = useContextSelector(TimerContext, (v) => v.remain);
  const duration = useContextSelector(TimerContext, (v) => v.duration);
  const formatTime = useContextSelector(TimerContext, (v) => v.formatTime);
  const reset = useContextSelector(TimerContext, (v) => v.reset);
  const onClickActionButton = useContextSelector(
    TimerContext,
    (v) => v.onClickActionButton
  );

  if (!timer) {
    return <div>타이머를 선택해주세요</div>;
  }

  return (
    <div>
      <div className={'relative flex flex-col items-center justify-center'}>
        <ProgressCircle
          size={320}
          progress={progress}
          color={'oklch(0.769 0.188 70.08)'}
          strokeWidth={10}
          bgColor={'#3A3A3A'}
        />
        <div className={'absolute top-1/2 -translate-y-1/2'}>
          <AnimateNumber
            className={'text-5xl font-bold'}
            value={remain}
            format={formatTime}
          />
        </div>
        <div className={'absolute bottom-1/4'}>
          <p className={'text-sm opacity-60'}>{formatTime(duration)}</p>
        </div>
      </div>
      <Space y={20} />
      <div className={'flex justify-center gap-3'}>
        <button
          className={cn('icon-circle-btn', {
            'bg-red-500': !isPlayable,
          })}
          onClick={onClickActionButton}
        >
          {isPlayable ? (
            <FaPlay className={'translate-x-[2px]'} />
          ) : (
            <FaPause />
          )}
        </button>
        <button className={'icon-circle-btn'} onClick={reset}>
          <GrPowerReset />
        </button>
      </div>
    </div>
  );
};

export default ActiveTimer;
