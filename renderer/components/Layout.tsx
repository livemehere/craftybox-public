import { Outlet } from 'react-router';

import NavBar from '@/components/NavBar';
import TabRouter from '@/components/TabRouter';

export default function Layout() {
  return (
    <div
      className={'dark text-foreground bg-background flex h-screen w-screen'}
    >
      <div className={'flex flex-1 flex-col'}>
        <NavBar />
        <TabRouter />
        <main className={'flex-1 overflow-x-hidden overflow-y-scroll'}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
