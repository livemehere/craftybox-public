import { Route, Routes, useNavigate } from 'react-router';
import { lazy } from 'react';

import Layout from '@/components/Layout';
import useOn from '@/hooks/electron/useOn';

const HomePage = lazy(() => import('@/pages/HomePage'));

/* tools */
const ScreenShotPage = lazy(() => import('@/pages/tools/ScreenShotPage'));
const ColorPickerPage = lazy(() => import('@/pages/tools/ColorPickerPage'));
const TimerPage = lazy(() => import('@/pages/tools/TimerPage'));

/* settings */
const GeneralSettingPage = lazy(() => import('@/pages/settings/GeneralSettingPage'));
const ShortCutSettingPage = lazy(() => import('@/pages/settings/ShortCutSettingPage'));

export default function App() {
  const navigate = useNavigate();
  useOn('route', ({ path }) => {
    navigate(path);
  });
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path={'/tools'}>
          <Route path={'/tools/screenshot'} element={<ScreenShotPage />} />
          <Route path={'/tools/timer'} element={<TimerPage />} />
          <Route path={'/tools/color-picker'} element={<ColorPickerPage />} />
        </Route>
        <Route path={'/settings'}>
          <Route path={'/settings'} element={<GeneralSettingPage />} />
          <Route path={'/settings/shortcuts'} element={<ShortCutSettingPage />} />
        </Route>
        <Route path={'/'} element={<HomePage />} />
        <Route path={'*'} element={<div>404</div>} />
      </Route>
    </Routes>
  );
}
