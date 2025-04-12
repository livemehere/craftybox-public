import { useQuery } from '@tanstack/react-query';
import { rendererIpc } from '@electron-buddy/ipc/renderer';

export const usePlatform = () => {
  const { data } = useQuery({
    queryKey: ['platform'],
    queryFn: () => rendererIpc.invoke('platform:get', null),
    staleTime: Infinity,
  });
  return data;
};
