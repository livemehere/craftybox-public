import { rendererIpc } from '@electron-buddy/ipc/renderer';
import { useQuery } from '@tanstack/react-query';

import { ScreenShotPageQsState } from '@/pages/tools/ScreenShotPage';

import CaptureTarget from './CaptureTarget';

export default function ItemList({
  type,
}: {
  type: ScreenShotPageQsState['tab'];
}) {
  const { data } = useQuery({
    queryKey: ['snapshot:list', type],
    queryFn: () => rendererIpc.invoke('snapshot:list', { type }),
    refetchInterval: 500,
    select: (data) => {
      return data.sort((a, b) => {
        if (a.name === b.name) {
          return 0;
        }
        if (a.name > b.name) {
          return 1;
        }
        return -1;
      });
    },
  });

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-x-12 gap-y-30">
      {data?.map((item) => (
        <CaptureTarget
          key={item.id}
          type={type}
          id={item.id}
          name={item.name}
          dataUrl={item.dataUrl}
          appIcon={item.appIcon}
          originWidth={item.width}
          originScaleFactor={item.scaleFactor}
        />
      ))}
    </div>
  );
}
