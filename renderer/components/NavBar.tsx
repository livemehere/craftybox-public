import { Link, NavLink } from 'react-router';

import { IconKeys } from '@/components/icons/IconMap';
import { Icon } from '@/components/icons/Icon';
import AppButtons from '@/components/AppButtons';
import { cn } from '@/utils/cn';

const TABS: {
  iconName: IconKeys;
  name: string;
  path: string;
}[] = [
  {
    iconName: 'img',
    name: 'SCREENSHOT',
    path: '/tools/screenshot',
  },
  {
    iconName: 'record',
    name: 'RECORDING',
    path: '/tools/recording',
  },
  {
    iconName: 'settings',
    name: 'SETTINGS',
    path: '/settings',
  },
];

const NavBar = () => {
  return (
    <nav className={'drag-zone relative flex h-20 shrink-0 justify-between'}>
      <Link
        className={'no-drag-zone flex items-center pl-8 text-lg font-bold'}
        to={'/'}
      >
        CRAFTYBOX
      </Link>
      <div
        className={
          'no-drag-zone absolute left-1/2 mt-8 flex -translate-x-1/2 items-center justify-center gap-8 rounded-full bg-[#111111] px-4 text-sm'
        }
      >
        {TABS.map((tab) => (
          <NavLink
            to={tab.path}
            key={tab.path}
            className={({ isActive }) =>
              cn('flex items-center gap-2 px-2 py-3', {
                'opacity-50': !isActive,
              })
            }
          >
            <Icon name={tab.iconName} className={'scale-80'} />
            <span>{tab.name}</span>
          </NavLink>
        ))}
      </div>
      <AppButtons />
    </nav>
  );
};

export default NavBar;
