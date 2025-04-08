import { GrHomeRounded } from 'react-icons/gr';
import { RiSettings4Fill } from 'react-icons/ri';
import { BiScreenshot, BiWindows } from 'react-icons/bi';
import { CgColorPicker } from 'react-icons/cg';
import { RxTimer } from 'react-icons/rx';
import { TfiClose } from 'react-icons/tfi';
import { rendererIpc } from '@electron-buddy/ipc/renderer';
import { FaRegWindowMinimize } from 'react-icons/fa';
import { RiArchive2Line } from 'react-icons/ri';
import { SiShortcut } from 'react-icons/si';

import { TNavItemGroup } from '../types/sidebar';

export const sideBarMenus: TNavItemGroup[] = [
  {
    groupName: '일반',
    items: [
      {
        itemName: '홈',
        Icon: GrHomeRounded,
        path: '/',
      },
      {
        itemName: '설정',
        Icon: RiSettings4Fill,
        subItems: [
          {
            itemName: '일반',
            path: '/settings',
          },
          {
            itemName: '단축키',
            path: '/settings/shortcuts',
          },
        ],
      },
    ],
  },
  {
    groupName: '도구',
    items: [
      {
        itemName: '스크린샷',
        Icon: BiScreenshot,
        path: '/tools/screenshot',
      },
      {
        itemName: '타이머',
        Icon: RxTimer,
        path: '/tools/timer',
      },
      {
        itemName: 'Color Picker',
        Icon: CgColorPicker,
        path: '/tools/color-picker',
      },
    ],
  },
  {
    groupName: '워크스페이스',
    items: [
      {
        itemName: '아카이브',
        Icon: RiArchive2Line,
        path: '/workspace/archive',
      },
    ],
  },
  {
    groupName: '에디터',
    items: [
      {
        itemName: '캔버스',
        Icon: SiShortcut,
        path: '/editor/canvas',
      },
    ],
  },
];

export const appButtons = [
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
