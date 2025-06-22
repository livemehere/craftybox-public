import { Route, Routes, useNavigate } from 'react-router';
import { lazy } from 'react';

import Layout from '@/components/Layout';
import useOn from '@/hooks/electron/useOn';

/* tools */
const ScreenShotPage = lazy(() => import('@/pages/tools/ScreenShotPage'));

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
        </Route>
        <Route path={'/settings'}>
          <Route path={'/settings'} element={<GeneralSettingPage />} />
          <Route path={'/settings/shortcuts'} element={<ShortCutSettingPage />} />
        </Route>
        <Route path={'*'} element={<div>404</div>} />
      </Route>
    </Routes>
  );
}
