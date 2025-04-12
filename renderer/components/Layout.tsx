import { Outlet } from 'react-router';

import NavBar from '@/components/NavBar';
import TimerPopup from '@/features/timer/components/TimerPopup';

import LNB from '../features/LNB/components';

export default function Layout() {
  return (
    <div className={'flex h-screen w-screen'}>
      <LNB />
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
