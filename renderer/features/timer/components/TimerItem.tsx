import { MdOutlineRemoveCircleOutline } from 'react-icons/md';
import { GoCheckCircleFill, GoCheckCircle } from 'react-icons/go';
import { Ref, useState } from 'react';
import { secondToTime } from '@fewings/core/converter';
import { motion } from 'motion/react';
import { useSetAtom } from 'jotai';

import { ITimer } from '@/features/timer/types';
import { formatToTimeString } from '@/lib/ui-kit/input-utils/formatter';
import { cn } from '@/utils/cn';
import {
  removeTimerAtom,
  setActiveTimerAtom,
  setDurationAtom,
} from '@/features/timer/stores/timersAtom';

interface Props {
  timer: ITimer;
  inputRef?: Ref<HTMLInputElement>;
}

const TimerItem = ({ timer, inputRef }: Props) => {
  const { h, m, s } = secondToTime(timer.duration, 'h');
  const formatted = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  const [input, setInput] = useState(formatted);

  const setActive = useSetAtom(setActiveTimerAtom);
  const remove = useSetAtom(removeTimerAtom);
  const setDuration = useSetAtom(setDurationAtom);

  return (
    <motion.li
      layout
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded px-2 transition-colors hover:bg-neutral-800',
        {
          'bg-neutral-800': timer.active,
        }
      )}
      onClick={() => setActive(timer.id)}
      animate={{
        height: [0, 40],
        opacity: [0, 1],
      }}
      exit={{
        height: 0,
        opacity: 0,
      }}
    >
      <div className={'mr-2'}>
        {timer.active ? (
          <GoCheckCircleFill className={'fill-amber-500'} />
        ) : (
          <GoCheckCircle />
        )}
      </div>
      <input
        ref={inputRef}
        className={'w-[60px] text-sm outline-none'}
        type="text"
        value={input}
        onBeforeInput={(e) => {
          const char = (e.nativeEvent as unknown as { data: string }).data;
          if (!/^\d+$/.test(char)) {
            e.preventDefault();
          }
        }}
        onFocus={(e) => {
          e.target.select();
        }}
        onChange={(e) => {
          const result = formatToTimeString(e.target.value, 'hour');
          setInput(result);
          if (result.length === 8) {
            const [h, m, s] = result.split(':').map((v) => parseInt(v, 10));
            setDuration({
              id: timer.id,
              duration: h * 3600 + m * 60 + s,
            });
            e.target.blur();
          }
        }}
      />
      <button
        onClick={() => remove(timer.id)}
        className={'icon-warn-btn ml-auto p-2'}
      >
        <MdOutlineRemoveCircleOutline />
      </button>
    </motion.li>
  );
};

export default TimerItem;
