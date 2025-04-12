import { createRoot } from 'react-dom/client';
import { DevTools } from 'jotai-devtools';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import 'jotai-devtools/styles.css';
import '@/styles/index.css';

import Providers from '@/Providers';
import App from '@/App';

import { LoggerProvider } from './providers/LoggerProvider';

const root = createRoot(document.getElementById('app')!);
root.render(
  <LoggerProvider>
    <Providers>
      <ReactQueryDevtools />
      <DevTools />
      <App />
    </Providers>
  </LoggerProvider>
);
