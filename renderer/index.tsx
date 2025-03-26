import { createRoot } from 'react-dom/client';
import { DevTools } from 'jotai-devtools';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import 'jotai-devtools/styles.css';
import '@/styles/index.css';

import Providers from './components/Providers';

import App from '@/App';

const root = createRoot(document.getElementById('app')!);
root.render(
  <Providers>
    <ReactQueryDevtools />
    <DevTools />
    <App />
  </Providers>
);
