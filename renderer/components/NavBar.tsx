import { useAtomValue, useSetAtom } from 'jotai';
import { FiSidebar } from 'react-icons/fi';
import { IoIosArrowForward } from 'react-icons/io';
import { Fragment } from 'react';

import { breadcrumbAtom } from '@/stores/breadcrumbAtom';
import { sideBarOpenAtom } from '@/stores/sideBarOpenAtom';

const NavBar = () => {
  const setSideBarOpen = useSetAtom(sideBarOpenAtom);
  const toggleSideBar = () => setSideBarOpen((prev) => !prev);

  const breadcrumb = useAtomValue(breadcrumbAtom);

  return (
    <nav className={'drag-zone flex h-14 min-h-14 items-center'}>
      <div className={'no-drag-zone flex items-center px-4'}>
        <button className={'basic-btn mr-3 p-2'} onClick={toggleSideBar}>
          <FiSidebar />
        </button>
        <div className={'h-3 w-[1px] bg-neutral-600'} />
        <div className={'ml-3 flex items-center gap-2 text-xs opacity-60'}>
          {breadcrumb.map((item, index) => {
            const isLastIdx = index === breadcrumb.length - 1;
            return (
              <Fragment key={item.name}>
                <span key={index}>{item.name}</span>
                {!isLastIdx && <IoIosArrowForward />}
              </Fragment>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
