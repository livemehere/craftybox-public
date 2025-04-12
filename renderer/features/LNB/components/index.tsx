import { Space } from '@fewings/react/components';
import { motion, Variants } from 'motion/react';
import { useAtomValue } from 'jotai';

import { cn } from '@/utils/cn';
import { usePlatform } from '@/queries/usePlatform';
import { lnbOpenAtom } from '@/features/LNB/stores/lnbOpenAtom';

import AppButtons from './AppButtons';
import MenuItem from './MenuItem';
import { LNB_MENUS } from '../schema';

const VARIANTS: Variants = {
  open: {
    width: 'var(--side-bar-width)',
    minWidth: 'var(--side-bar-width)',
  },
  close: {
    width: 0,
    minWidth: 0,
    borderRightWidth: 0,
    paddingLeft: 0,
    paddingRight: 0,
  },
};

const LNB = () => {
  const open = useAtomValue(lnbOpenAtom);
  const platform = usePlatform();

  return (
    <motion.aside
      className={cn(
        'overflow-hidden border-r-[1px] border-neutral-700 bg-neutral-900/98 px-2 py-3',
        'whitespace-nowrap'
      )}
      initial={open ? 'open' : 'close'}
      animate={open ? 'open' : 'close'}
      variants={VARIANTS}
      transition={{
        duration: 0.2,
        type: 'spring',
        stiffness: 300,
        damping: 40,
      }}
    >
      {platform === 'darwin' && <AppButtons />}
      {/*<CurrentUser />*/}
      <Space y={12} />
      {LNB_MENUS.map((category, index) => (
        <section className={'mb-3'} key={index}>
          <label className={'pl-2 text-xs opacity-70'}>
            {category.category}
          </label>
          <div className={'mt-2 space-y-0.5'}>
            {category.children.map((item, index) => (
              <MenuItem
                key={index}
                parentPathKey={category.pathKey}
                item={item}
                depth={1}
              />
            ))}
          </div>
        </section>
      ))}
    </motion.aside>
  );
};

export default LNB;
