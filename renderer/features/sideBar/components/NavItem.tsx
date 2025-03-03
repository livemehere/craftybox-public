import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { IoIosArrowForward } from 'react-icons/io';
import { motion } from 'motion/react';

import { TNavItem } from '@/features/sideBar/types';

interface Props {
  item: TNavItem;
}

const NavItem = ({ item }: Props) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <li className={'pl-0.5 text-sm'}>
      <button
        className={'basic-btn flex w-full items-center gap-2 rounded p-1.5'}
        onClick={() => {
          if (item.subItems) {
            setOpen((prev) => !prev);
          } else {
            if (item.path) {
              navigate(item.path);
            }
          }
        }}
        data-active={item.path === location.pathname}
      >
        {item.Icon && <item.Icon className={'shrink-0'} />}
        <div className={'flex w-full items-center justify-between'}>
          <div>{item.itemName}</div>
          {item.subItems && (
            <IoIosArrowForward
              style={{
                transition: 'transform 0.1s',
                transform: `rotate(${open ? 90 : 0}deg)`
              }}
            />
          )}
        </div>
      </button>
      {open && item.subItems && (
        <div className={'relative mt-2 flex flex-col gap-2 pl-5.5 opacity-80'}>
          <GroupItemLeftLine />
          {item.subItems?.map((child, index) => (
            <button
              key={index}
              className={'basic-btn px-2 py-1.5 text-start'}
              onClick={(e) => {
                e.stopPropagation();
                if (child.path) {
                  navigate(child.path);
                }
              }}
              data-active={child.path === location.pathname}
            >
              {child.itemName}
            </button>
          ))}
        </div>
      )}
    </li>
  );
};

export default NavItem;

const GroupItemLeftLine = () => {
  return (
    <motion.div
      animate={{
        scale: [0, 1],
        transformOrigin: 'top',
        transition: {
          duration: 0.5
        }
      }}
      className={'absolute top-0 left-2.5 h-full w-[1px] bg-white opacity-20'}
    ></motion.div>
  );
};
