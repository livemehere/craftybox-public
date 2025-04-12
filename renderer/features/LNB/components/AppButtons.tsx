import { cn } from '@/utils/cn';

import { DRAG_BAR_BUTTONS } from '../schema';

const AppButtons = () => {
  return (
    <div className={'drag-zone mb-2.5 flex h-4 items-center gap-2 pl-1'}>
      {DRAG_BAR_BUTTONS.map((b, i) => (
        <button
          key={i}
          onClick={b.onClick}
          className={cn(
            'no-drag-zone h-3 w-3 rounded-full bg-red-500',
            b.color
          )}
        ></button>
      ))}
    </div>
  );
};

export default AppButtons;
