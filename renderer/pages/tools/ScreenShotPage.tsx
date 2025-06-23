import { useQsState } from '@fewings/react-qs';
import { Tabs, Tab } from '@heroui/tabs';

import CaptureTargetList from '@/features/screenshot/components/CaptureTargetList';

type TTabs = 'screen' | 'window';
export type ScreenShotPageQsState = {
  tab: TTabs;
};

const TABS = [
  { key: 'screen', label: 'SCREEN' },
  { key: 'window', label: 'WINDOW' },
];

const ScreenShotPage = () => {
  const [qs, setQs] = useQsState<ScreenShotPageQsState>({
    tab: 'screen',
  });

  return (
    <div className={'px-7.5 py-5'}>
      <section className="flex items-center justify-center gap-1">
        <Tabs
          color={'primary'}
          selectedKey={qs.tab}
          onSelectionChange={(key) => {
            setQs((prev) => ({ ...prev, tab: key as TTabs }));
          }}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.key}
              value={tab.key}
              title={<span>{tab.label}</span>}
            />
          ))}
        </Tabs>
      </section>
      <section className="mt-5">
        <CaptureTargetList type={qs.tab} />
      </section>
    </div>
  );
};

export default ScreenShotPage;
