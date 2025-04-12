import { createRoot } from 'react-dom/client';
import { DevTools } from 'jotai-devtools';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import '@/styles/index.css';

import AppProviders from '@/providers/AppProviders';
import App from '@/App';

import { LoggerProvider } from './providers/LoggerProvider';

if (import.meta.env.DEV) {
  import('jotai-devtools/styles.css');
}

const root = createRoot(document.getElementById('app')!);
root.render(
  <LoggerProvider>
    <AppProviders>
      <ReactQueryDevtools />
      <DevTools />
      <App />
    </AppProviders>
  </LoggerProvider>
);
