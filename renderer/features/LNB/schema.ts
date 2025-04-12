import { IconType } from 'react-icons';
import { RiArchive2Line } from 'react-icons/ri';
import { GrHomeRounded } from 'react-icons/gr';
import { RiSettings4Fill } from 'react-icons/ri';
import { BiScreenshot, BiWindows } from 'react-icons/bi';
import { CgColorPicker } from 'react-icons/cg';
import { RxTimer } from 'react-icons/rx';
import { rendererIpc } from '@electron-buddy/ipc/renderer';
import { FaRegWindowMinimize } from 'react-icons/fa';
import { TfiClose } from 'react-icons/tfi';
import { GrTopCorner } from 'react-icons/gr';

interface LnbCategory {
  category: string;
  children: LnbItem[];
  pathKey: string;
}

export interface LnbItem {
  name: string;
  pathKey: string;
  Icon: IconType;
  children?: LnbItem[];
}

export const LNB_MENUS: LnbCategory[] = [
  {
    category: 'general',
    pathKey: '',
    children: [
      {
        Icon: GrHomeRounded,
        name: 'Home',
        pathKey: '',
      },
      {
        Icon: RiSettings4Fill,
        name: 'Settings',
        pathKey: 'settings',
        children: [
          {
            Icon: GrTopCorner,
            name: 'general',
            pathKey: '',
          },
          {
            Icon: GrTopCorner,
            name: 'shortcuts',
            pathKey: 'shortcuts',
          },
        ],
      },
    ],
  },
  {
    category: 'tools',
    pathKey: 'tools',
    children: [
      {
        Icon: BiScreenshot,
        name: 'Screenshot',
        pathKey: 'screenshot',
      },
      {
        Icon: RxTimer,
        name: 'Timer',
        pathKey: 'timer',
      },
      {
        Icon: CgColorPicker,
        name: 'Color Picker',
        pathKey: 'color-picker',
      },
    ],
  },
  {
    category: 'workspace',
    pathKey: 'workspace',
    children: [
      {
        Icon: RiArchive2Line,
        name: 'Archive',
        pathKey: 'archive',
      },
    ],
  },
];

export const DRAG_BAR_BUTTONS = [
  {
    Icon: TfiClose,
    color: 'bg-red-500',
    onClick: () => {
      rendererIpc.invoke('window:hide', 'main');
    },
  },
  {
    icon: FaRegWindowMinimize,
    color: 'bg-amber-500',
    onClick: () => {
      rendererIpc.invoke('window:minimize', null);
    },
  },
  {
    icon: BiWindows,
    color: 'bg-green-700',
    onClick: () => {
      rendererIpc.invoke('window:maximize', null);
    },
  },
] as const;
