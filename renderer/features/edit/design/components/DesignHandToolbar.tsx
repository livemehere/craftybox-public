import { LuMousePointer2 } from 'react-icons/lu';
import { PiHandGrabbing } from 'react-icons/pi';
import { BiRectangle } from 'react-icons/bi';
import { useAtom } from 'jotai';

import { EditMode, modeAtom } from '@/features/edit/design/stores';
import { cn } from '@/utils/cn';

const buttons: { icon: React.ReactNode; mode: EditMode }[] = [
  {
    icon: <LuMousePointer2 className={'h-20 w-20'} />,
    mode: 'select',
  },
  {
    icon: <PiHandGrabbing className={'h-20 w-20 -translate-y-1'} />,
    mode: 'move',
  },
  {
    icon: <BiRectangle className={'h-20 w-20'} />,
    mode: 'draw-rect',
  },
];

const DesignHandToolbar = () => {
  const [mode, setMode] = useAtom(modeAtom);

  return (
    <div
      className={cn(
        'absolute bottom-80 left-1/2 z-10 -translate-x-1/2',
        'bg-app-gray rounded p-8',
        'flex items-center gap-8'
      )}
    >
      {buttons.map(({ icon, mode: _mode }, index) => (
        <button
          key={index}
          className={
            'hover:bg-app-soft-gray [&[data-active=true]]:bg-app-primary cursor-pointer rounded p-8'
          }
          data-active={_mode === mode}
          onClick={() => setMode(_mode)}
        >
          {icon}
        </button>
      ))}
    </div>
  );
};

export default DesignHandToolbar;
