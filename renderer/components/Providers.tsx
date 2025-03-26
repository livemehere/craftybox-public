import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'jotai';

import TimerProvider from '@/features/timer/TimerProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false
    }
  }
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider>
      <QueryClientProvider client={queryClient}>
        <TimerProvider>{children}</TimerProvider>
      </QueryClientProvider>
    </Provider>
  );
}
