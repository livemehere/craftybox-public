import { useQsState } from '@fewings/react-qs';
import { rendererIpc } from '@electron-buddy/ipc/renderer';
import { useQuery } from '@tanstack/react-query';
import { MdOutlineMonitor } from 'react-icons/md';

import Tabs from '@/components/Tabs';

type Tabs = 'screen' | 'window';
type QsState = {
  tab: Tabs;
};

const ScreenShotPage = () => {
  const [qs, setQs] = useQsState<QsState>({
    tab: 'screen',
  });

  return (
    <div className={'h-full px-30 py-20'}>
      <section className="flex items-center justify-center gap-4">
        <Tabs
          tabs={[
            { key: 'screen', label: 'SCREEN' },
            { key: 'window', label: 'WINDOW' },
          ]}
          activeTab={qs.tab}
          setActiveTab={(key) => {
            setQs((prev) => ({ ...prev, tab: key as Tabs }));
          }}
        />
      </section>
      <section className="mt-20">
        <ItemList type={qs.tab} />
      </section>
    </div>
  );
};

export default ScreenShotPage;

function ItemList({ type }: { type: Tabs }) {
  const { data } = useQuery({
    queryKey: ['snapshot:list', type],
    queryFn: () => rendererIpc.invoke('snapshot:list', { type }),
    refetchInterval: 1000,
  });

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-12">
      {data?.map(
        ({ id, width, height, dataUrl, name, appIcon, scaleFactor }) => (
          <div
            key={id}
            onClick={async () => {
              const { dataUrl } = await rendererIpc.invoke('snapshot:capture', {
                type,
                id,
                width: width * scaleFactor || 1280,
                height: height * scaleFactor || 720,
              });

              const blob = await fetch(dataUrl).then((res) => res.blob());
              navigator.clipboard.write([
                new ClipboardItem({
                  [blob.type]: blob,
                }),
              ]);

              console.log(
                `copied, ${width * scaleFactor}x${height * scaleFactor}, ${id}`
              );
            }}
          >
            <div className="h-180 w-full rounded-lg bg-neutral-950">
              <img
                src={dataUrl}
                alt={name}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="mt-8 flex">
              <div className="bg-app-gray mr-10 h-40 w-40 shrink-0 rounded-full">
                {appIcon ? (
                  <img
                    src={appIcon}
                    alt="app-icon"
                    className="h-full w-full object-contain p-8"
                  />
                ) : (
                  <MdOutlineMonitor className="h-full w-full p-8" />
                )}
              </div>
              <div className="overflow-hidden">
                <p className="typo-body1 text-app-secondary truncate font-bold">
                  {name}
                </p>
                <p className="typo-body2 text-app-tertiary mt-4">{id}</p>
                <p className="typo-body2 text-app-tertiary mt-2">
                  {width}
                  <span className="opacity-50"> x </span>
                  {height}
                </p>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
