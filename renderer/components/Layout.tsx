import { Outlet } from 'react-router';

import NavBar from '@/components/NavBar';
import TimerPopup from '@/features/timer/components/TimerPopup';

import LNB from '../features/LNB/components';

export default function Layout() {
  return (
    <div
      className={'dark text-foreground bg-background flex h-screen w-screen'}
    >
      <LNB />
      <div className={'flex flex-1 flex-col'}>
        <NavBar />
        <main className={'flex-1 overflow-x-hidden overflow-y-scroll'}>
          <TimerPopup />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
