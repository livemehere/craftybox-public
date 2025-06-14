import { Suspense, useMemo } from 'react';
import {
  RouterProvider,
  createHashRouter,
  createMemoryRouter,
} from 'react-router';
import { HeroUIProvider } from '@heroui/react';

import { routes } from './routes';
import LoadingScene from './components/LoadingScene';
interface AppProps {
  routerType?: 'browser' | 'memory';
  initialEntries?: string[];
}

export default function App({
  routerType = 'browser',
  initialEntries = ['/'],
}: AppProps) {
  const router = useMemo(() => {
    if (routerType === 'browser') {
      return createHashRouter(routes);
    }
    return createMemoryRouter(routes, { initialEntries });
  }, [routerType, initialEntries]);

  return (
    <HeroUIProvider>
      <Suspense fallback={<LoadingScene />}>
        <RouterProvider router={router} />
      </Suspense>
    </HeroUIProvider>
  );
}
