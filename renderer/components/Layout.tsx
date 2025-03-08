import { Outlet } from 'react-router';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import log from 'electron-log/renderer';

import SideBar from '@/features/sideBar/components/SideBar';
import NavBar from '@/components/NavBar';
import LoadingScene from '@/components/LoadingScene';
import ErrorScene from '@/components/ErrorScene';
import TimerPopup from '@/features/timer/components/TimerPopup';

const logger = log.scope('Renderer Page');

export default function Layout() {
  return (
    <div className={'flex h-screen w-screen'}>
      <SideBar />
      <div className={'flex flex-1 flex-col bg-neutral-950'}>
        <NavBar />
        <main className={'flex-1 overflow-x-hidden overflow-y-auto'}>
          <TimerPopup />
          <ErrorBoundary
            fallback={<ErrorScene />}
            onError={(e) => {
              logger.error(e);
            }}
          >
            <Suspense fallback={<LoadingScene />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
