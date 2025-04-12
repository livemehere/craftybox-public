import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'jotai';

import { OverlayProvider } from '@/lib/overlay';
import TimerProvider from '@/features/timer/TimerProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: false,
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider>
      <QueryClientProvider client={queryClient}>
        <OverlayProvider>
          <TimerProvider>{children}</TimerProvider>
        </OverlayProvider>
      </QueryClientProvider>
    </Provider>
  );
}
