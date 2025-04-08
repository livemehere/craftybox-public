import { useAtomValue, useSetAtom } from 'jotai';
import { AnimatePresence } from 'motion/react';
import { IoIosAddCircleOutline } from 'react-icons/io';
import { FaLock } from 'react-icons/fa';
import { FaRegTrashAlt } from 'react-icons/fa';
import { useRef } from 'react';

import {
  addTimerAtom,
  removeAllTimersAtom,
  timersAtom,
} from '@/features/timer/stores/timersAtom';
import TimerItem from '@/features/timer/components/TimerItem';

const TimerList = () => {
  const timers = useAtomValue(timersAtom);
  const isAnyTimerPlaying = timers.some(
    (timer) => timer.status === 'running' || timer.status === 'paused'
  );

  const addNew = useSetAtom(addTimerAtom);
  const removeAll = useSetAtom(removeAllTimersAtom);

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      {isAnyTimerPlaying && (
        <div
          className={
            'absolute inset-0 flex items-center justify-center bg-black/50 text-xs'
          }
        >
          <FaLock className={'h-6 w-6'} />
        </div>
      )}
      <section className={'mb-2 flex items-center justify-between'}>
        <p>목록</p>
        <div className={'flex gap-1'}>
          <button
            className={'basic-btn icon-primary-btn p-1'}
            onClick={() => {
              addNew();
              requestAnimationFrame(() => {
                inputRef.current?.focus();
              });
            }}
          >
            <IoIosAddCircleOutline className={'h-6 w-6'} />
          </button>
          <button
            className={'basic-btn icon-warn-btn px-2 py-1'}
            onClick={() => removeAll()}
          >
            <FaRegTrashAlt className={'h-4 w-4'} />
          </button>
        </div>
      </section>
      <ul className={'flex flex-col gap-1'}>
        <AnimatePresence>
          {timers.map((timer, i) => {
            const ref = i === timers.length - 1 ? inputRef : undefined;
            return <TimerItem key={timer.id} timer={timer} inputRef={ref} />;
          })}
        </AnimatePresence>
      </ul>
    </>
  );
};

export default TimerList;
