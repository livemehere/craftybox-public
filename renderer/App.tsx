import { useMemo } from 'react';
import { RouterProvider } from 'react-router';
import { createHashRouter, createMemoryRouter } from 'react-router';

import { routes } from './routes';
interface AppProps {
  routerType?: 'browser' | 'memory';
  initialEntries?: string[];
}

export default function App({ routerType = 'browser', initialEntries = ['/'] }: AppProps) {
  const router = useMemo(() => {
    if (routerType === 'browser') {
      return createHashRouter(routes);
    }
    return createMemoryRouter(routes, { initialEntries });
  }, [routerType, initialEntries]);

  return <RouterProvider router={router} />;
}
