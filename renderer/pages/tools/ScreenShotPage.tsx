import { useQsState } from '@fewings/react-qs';

import Tabs from '@/components/Tabs';
import ItemList from '@/features/screenshot/components/CaptureTargetList';

type Tabs = 'screen' | 'window';
export type ScreenShotPageQsState = {
  tab: Tabs;
};

const ScreenShotPage = () => {
  const [qs, setQs] = useQsState<ScreenShotPageQsState>({
    tab: 'screen',
  });

  return (
    <div className={'px-30 py-20'}>
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
