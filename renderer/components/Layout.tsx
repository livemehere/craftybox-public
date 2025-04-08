import { Outlet, useNavigate } from 'react-router';
import { Suspense } from 'react';
import log from 'electron-log/renderer';

import SideBar from './Sidebar';

import ErrorBoundary from '@/components/ErrorBoundary';
import NavBar from '@/components/NavBar';
import LoadingScene from '@/components/LoadingScene';
import ErrorPage from '@/pages/ErrorPage';
import TimerPopup from '@/features/timer/components/TimerPopup';
import useOn from '@/hooks/electron/useOn';

const logger = log.scope('Renderer Page');

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
          <ErrorBoundary
            fallback={<ErrorPage />}
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
