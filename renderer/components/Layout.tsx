import { Outlet, useNavigate } from 'react-router';

import NavBar from '@/components/NavBar';
import TimerPopup from '@/features/timer/components/TimerPopup';
import useOn from '@/hooks/electron/useOn';

import SideBar from './Sidebar';

export default function Layout() {
  const navigate = useNavigate();
  useOn('route', ({ path }) => {
    navigate(path);
  });
  return (
    <div className={'flex h-screen w-screen'}>
      <SideBar />
      <div className={'flex flex-1 flex-col bg-neutral-950'}>
        <NavBar />
        <main className={'flex-1 overflow-x-hidden overflow-y-auto'}>
          <TimerPopup />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
