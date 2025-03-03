import { useAtomValue } from 'jotai';
import { useContextSelector } from '@fewings/react/contextSelector';
import { RxTimer } from 'react-icons/rx';
import { AnimatePresence, motion } from 'motion/react';
import { useLocation } from 'react-router';

import { activeTimerAtom } from '@/features/timer/stores/timersAtom';
import { TimerContext } from '@/features/timer/TimerProvider';
import { cn } from '@/utils/cn';

const TimerPopup = () => {
  const timer = useAtomValue(activeTimerAtom);
  const remain = useContextSelector(TimerContext, (v) => v.remain);
  const formatTime = useContextSelector(TimerContext, (v) => v.formatTime);
  const progress = useContextSelector(TimerContext, (v) => v.progress);
  const location = useLocation();

  const showPopup = timer?.status === 'running' && location.pathname !== '/tools/timer';

  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          className={'fixed top-4 right-4 w-[250px] rounded bg-neutral-800/80 p-2'}
          animate={{
            x: [20, 0],
            opacity: [0, 1]
          }}
          exit={{
            x: 20,
            opacity: 0
          }}
        >
          <p className={'mb-2 flex items-center gap-2 text-xs'}>
            <RxTimer />
            <span>{formatTime(remain)}</span>
          </p>
          <div className={'relative h-1 w-full bg-neutral-600'}>
            <motion.div
              className={'h-full w-full origin-left bg-amber-500'}
              animate={{
                scaleX: progress
              }}
              transition={{
                type: 'keyframes'
              }}
            />
            <motion.div
              className={'absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500'}
              animate={{
                left: `${progress * 100}%`
              }}
            />
            <motion.div
              className={cn(
                'absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500',
                'animate-ping'
              )}
              animate={{
                left: `${progress * 100}%`
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TimerPopup;
