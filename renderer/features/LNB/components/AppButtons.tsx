import { TfiClose } from 'react-icons/tfi';
import { rendererIpc } from '@electron-buddy/ipc/renderer';
import { FaRegWindowMinimize } from 'react-icons/fa';
import { BiWindows } from 'react-icons/bi';

const DRAG_BAR_BUTTONS = [
  {
    Icon: FaRegWindowMinimize,
    onClick: () => {
      rendererIpc.invoke('window:minimize', null);
    },
  },
  {
    Icon: BiWindows,
    onClick: () => {
      rendererIpc.invoke('window:maximize', null);
    },
  },
  {
    Icon: TfiClose,
    onClick: () => {
      rendererIpc.invoke('window:hide', 'main');
    },
  },
] as const;

const AppButtons = () => {
  return (
    <div className={'flex'}>
      {DRAG_BAR_BUTTONS.map((b, i) => (
        <button
          key={i}
          onClick={b.onClick}
          className={
            'no-drag-zone hover:bg-app-soft-gray flex h-full items-center justify-center px-12'
          }
        >
          <b.Icon className={'w-12'} />
        </button>
      ))}
    </div>
  );
};

export default AppButtons;
