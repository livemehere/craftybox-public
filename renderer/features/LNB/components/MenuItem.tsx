import { NavLink, useLocation } from 'react-router';
import { IoIosArrowForward } from 'react-icons/io';

import { cn } from '@/utils/cn';

import { LnbItem } from '../schema';

interface Props {
  parentPathKey: string;
  item: LnbItem;
  depth: number;
}

const MenuItem = ({ parentPathKey, item, depth }: Props) => {
  const { pathname } = useLocation();

  const path = [parentPathKey, item.pathKey].join('/');
  const finalPath = path.endsWith('/') ? path : `${path}/`;
  const isEnd = !item.children;
  const isSubMenu = depth > 1;
  const open = pathname.includes(item.pathKey);

  return (
    <>
      <NavLink to={finalPath} className={'block'} end={isEnd}>
        {({ isActive }) => (
          <div
            style={{ paddingLeft: `${depth * 8}px` }}
            className={
              'pressable flex w-full items-center gap-2 rounded py-1.5 pr-1.5 text-sm transition-all duration-75'
            }
            data-active={isEnd ? isActive : false}
          >
            <item.Icon
              className={cn('shrink-0', {
                'rotate-270 opacity-50': isSubMenu,
              })}
            />
            <div className={'flex w-full items-center justify-between'}>
              <span>{item.name}</span>
              {item.children && (
                <IoIosArrowForward
                  style={{
                    transition: 'transform 0.1s',
                    transform: `rotate(${open ? 90 : 0}deg)`,
                  }}
                />
              )}
            </div>
          </div>
        )}
      </NavLink>
      {open &&
        item.children?.map((child) => (
          <MenuItem
            key={child.pathKey}
            parentPathKey={path}
            item={child}
            depth={depth + 1}
          />
        ))}
    </>
  );
};

export default MenuItem;
