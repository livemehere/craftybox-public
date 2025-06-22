import { Navigate, RouteObject } from 'react-router';
import { lazy } from 'react';

import ErrorPage from '@/pages/ErrorPage';
import Layout from '@/components/Layout';

const HomePage = lazy(() => import('@/pages/home'));

/* tools */
const ScreenShotPage = lazy(() => import('@/pages/tools/ScreenShotPage'));
const RecordingPage = lazy(() => import('@/pages/tools/RecordingPage'));

/* settings */
const SettingsPage = lazy(() => import('@/pages/settings'));

/* workspace */
const ArchivePage = lazy(() => import('@/pages/workspace/ArchivePage'));

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    errorElement: import.meta.env.DEV ? <ErrorPage /> : <Navigate to="/" />,
    children: [
      {
        index: true,
        id: 'home',
        Component: HomePage,
      },
      {
        path: 'settings',
        id: 'Settings',
        Component: SettingsPage,
      },
      {
        path: 'tools',
        id: 'Tools',
        children: [
          {
            path: 'screenshot',
            id: 'Screenshot',
            Component: ScreenShotPage,
          },
          {
            path: 'recording',
            id: 'Recording',
            Component: RecordingPage,
          },
        ],
      },
      {
        path: 'workspace',
        id: 'Workspace',
        children: [
          {
            path: 'archive',
            id: 'Archive',
            Component: ArchivePage,
          },
        ],
      },
    ],
  },
];
