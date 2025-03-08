import { createRoot } from 'react-dom/client';
import { DevTools } from 'jotai-devtools';
import { HashRouter } from 'react-router';
import { Provider } from 'jotai';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import 'jotai-devtools/styles.css';
import '@/styles/index.css';
import { minToMs } from '@shared/utils/time';
import { ErrorBoundary } from 'react-error-boundary';
import log from 'electron-log/renderer';

import App from '@/App';
import ErrorScene from '@/components/ErrorScene';
import TimerProvider from '@/features/timer/TimerProvider';

const logger = log.scope('Renderer Root');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: minToMs(1),
      gcTime: minToMs(5)
    }
  }
});

const root = createRoot(document.getElementById('app')!);
root.render(
  <ErrorBoundary
    fallback={
      <div className={'drag-zone h-screen w-screen'}>
        <ErrorScene />
      </div>
    }
    onError={(e) => {
      logger.error(e);
    }}
  >
    <Provider>
      <QueryClientProvider client={queryClient}>
        <TimerProvider>
          <ReactQueryDevtools />
          <DevTools />
          <HashRouter>
            <App />
          </HashRouter>
        </TimerProvider>
      </QueryClientProvider>
    </Provider>
  </ErrorBoundary>
);
