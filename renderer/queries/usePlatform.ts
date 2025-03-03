import { useSuspenseQuery } from '@tanstack/react-query';
import { rendererIpc } from '@electron-buddy/ipc/renderer';

export const usePlatform = () => {
  return useSuspenseQuery({
    queryKey: ['platform'],
    queryFn: () => rendererIpc.invoke('platform:get', null),
    staleTime: Infinity
  });
};
