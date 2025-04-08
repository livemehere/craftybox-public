import { Navigate, RouteObject } from 'react-router';
import { lazy } from 'react';

import ErrorPage from '@/pages/ErrorPage';
import Layout from '@/components/Layout';

const HomePage = lazy(() => import('@/pages/HomePage'));

/* tools */
const ScreenShotPage = lazy(() => import('@/pages/tools/ScreenShotPage'));
const ColorPickerPage = lazy(() => import('@/pages/tools/ColorPickerPage'));
const TimerPage = lazy(() => import('@/pages/tools/TimerPage'));

/* settings */
const GeneralSettingPage = lazy(() => import('@/pages/settings/GeneralSettingPage'));
const ShortCutSettingPage = lazy(() => import('@/pages/settings/ShortCutSettingPage'));

/* workspace */
const ArchivePage = lazy(() => import('@/pages/workspace/ArchivePage'));

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    errorElement: import.meta.env.DEV ? <ErrorPage /> : <Navigate to='/' />,
    children: [
      {
        index: true,
        id: 'home',
        Component: HomePage
      },
      {
        path: 'tools',
        id: 'tools',
        children: [
          {
            path: 'screenshot',
            id: 'screenshot',
            Component: ScreenShotPage
          },
          {
            path: 'timer',
            id: 'timer',
            Component: TimerPage
          },
          {
            path: 'color-picker',
            id: 'color-picker',
            Component: ColorPickerPage
          }
        ]
      },
      {
        path: 'workspace',
        id: 'workspace',
        children: [
          {
            path: 'archive',
            id: 'archive',
            Component: ArchivePage
          }
        ]
      },
      {
        path: 'settings',
        id: 'settings',
        children: [
          {
            index: true,
            id: 'general',
            Component: GeneralSettingPage
          },
          {
            path: 'shortcuts',
            id: 'shortcuts',
            Component: ShortCutSettingPage
          }
        ]
      }
    ]
  }
];
