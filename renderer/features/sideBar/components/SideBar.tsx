import { Space } from '@fewings/react/components';
import { motion } from 'motion/react';
import { useAtomValue } from 'jotai';

// import CurrentUser from '@/features/sideBar/components/CurrentUser';
import AppButtons from '@/features/sideBar/components/AppButtons';
import { sideBarOpenAtom } from '@/stores/sideBarOpenAtom';
import { cn } from '@/utils/cn';
import { usePlatform } from '@/queries/usePlatform';
import { sideBarMenus } from '@/features/sideBar/constants';
import NavGroup from '@/features/sideBar/components/NavGroup';
import NavItem from '@/features/sideBar/components/NavItem';

const SideBar = () => {
  const open = useAtomValue(sideBarOpenAtom);
  const { data: platform } = usePlatform();

  return (
    <motion.aside
      className={cn(
        'overflow-hidden border-r-[1px] border-neutral-700 bg-neutral-900/80 px-2 py-3',
        'whitespace-nowrap'
      )}
      initial={open ? 'open' : 'close'}
      animate={open ? 'open' : 'close'}
      variants={{
        open: {
          width: 'var(--side-bar-width)'
        },
        close: {
          width: 0,
          borderRightWidth: 0,
          paddingLeft: 0,
          paddingRight: 0
        }
      }}
      transition={{
        duration: 0.2,
        type: 'spring',
        stiffness: 300,
        damping: 40
      }}
    >
      {platform === 'darwin' && <AppButtons />}
      {/*<CurrentUser />*/}
      <Space y={12} />
      {sideBarMenus.map((group, index) => (
        <NavGroup key={index} name={group.groupName}>
          {group.items.map((item, index) => (
            <NavItem key={index} item={item} />
          ))}
        </NavGroup>
      ))}
    </motion.aside>
  );
};

export default SideBar;
