import { appButtons } from '../../constants/sidebar';

import { cn } from '@/utils/cn';

const AppButtons = () => {
  return (
    <div className={'drag-zone mb-2.5 flex h-4 items-center gap-2 pl-1'}>
      {appButtons.map((b, i) => (
        <button
          key={i}
          onClick={b.onClick}
          className={cn('no-drag-zone h-3 w-3 rounded-full bg-red-500', b.color)}
        ></button>
      ))}
    </div>
  );
};

export default AppButtons;
