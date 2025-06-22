import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'jotai';
import { HeroUIProvider } from '@heroui/react';
import { ToastProvider } from '@heroui/toast';

import { OverlayProvider } from '@/lib/overlay';

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
          <HeroUIProvider>
            <ToastProvider toastOffset={10} />
            {children}
          </HeroUIProvider>
        </OverlayProvider>
      </QueryClientProvider>
    </Provider>
  );
}
