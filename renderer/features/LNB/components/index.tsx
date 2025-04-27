import { useAtom } from 'jotai/index';
import { NavLink } from 'react-router';

import { lnbOpenAtom } from '@/features/LNB/stores/lnbOpenAtom';
import { Icon } from '@/components/icons/Icon';
import { IconKeys } from '@/components/icons/IconMap';
import { cn } from '@/utils/cn';

const menu: {
  iconName: IconKeys;
  name: string;
  path: string;
  iconClass?: string;
  colorType: 'stroke' | 'fill';
  end?: boolean;
}[] = [
  {
    iconName: 'expand',
    name: 'SCREENSHOT',
    path: '/tools/screenshot',
    iconClass: 'p-3',
    colorType: 'stroke',
  },
  {
    iconName: 'record',
    name: 'RECORDING',
    path: '/tools/recording',
    colorType: 'stroke',
  },
  {
    iconName: 'edit',
    name: 'EDIT',
    path: '/tools/edit',
    colorType: 'stroke',
  },
  {
    end: true,
    iconName: 'settings',
    name: 'SETTINGS',
    path: '/settings',
    iconClass: 'p-3',
    colorType: 'fill',
  },
];

const EXPAND_WIDTH = 224;
const COLLAPSE_WIDTH = 64;

const LNB = () => {
  const [open, setSideBarOpen] = useAtom(lnbOpenAtom);
  const toggleSideBar = () => setSideBarOpen((prev) => !prev);

  return (
    <aside
      className={'flex flex-col overflow-hidden rounded-l-xl px-12 py-15'}
      style={{ width: open ? EXPAND_WIDTH : COLLAPSE_WIDTH }}
    >
      <div className={'flex items-center gap-8'}>
        <button className={'pressable'} onClick={toggleSideBar}>
          <Icon name={'hamberger'} />
        </button>
        {open && <span className={'leading-15 font-bold'}>CRAFTYBOX</span>}
      </div>

      <ul className={'mt-18 flex flex-1 flex-col gap-2'}>
        {menu.map((item, index) => (
          <li
            key={item.path}
            style={{
              marginTop: item.end ? 'auto' : undefined,
            }}
          >
            <NavLink to={item.path} key={index}>
              {({ isActive }) => (
                <div
                  className={cn(
                    'pressable typo-body2 flex items-center gap-14 px-8 py-6',
                    {
                      'text-app-primary': isActive,
                    }
                  )}
                >
                  <Icon
                    name={item.iconName}
                    className={cn(item.iconClass, {
                      '[&_path]:fill-app-primary':
                        isActive && item.colorType === 'fill',
                      '[&_path]:stroke-app-primary':
                        isActive && item.colorType === 'stroke',
                    })}
                  />
                  {open && <span>{item.name}</span>}
                </div>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default LNB;
