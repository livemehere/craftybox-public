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
    <div className="grid grid-cols-[repeat(auto-fill,300px)] gap-4">
      {data?.map(({ id, x, y, width, height, dataUrl, name }) => (
        <div key={id}>
          <img
            src={dataUrl}
            alt={name}
            className="aspect-video w-full rounded-lg"
          />
          <div className="mt-8 flex">
            <div className="bg-app-gray mr-10 h-40 w-40 rounded-full">
              <MdOutlineMonitor className="h-full w-full p-8" />
            </div>
            <div>
              <p className="typo-body1 text-app-secondary font-bold">{name}</p>
              <p className="typo-body2 text-app-tertiary mt-4">
                {width}
                <span className="opacity-50"> x </span>
                {height}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
