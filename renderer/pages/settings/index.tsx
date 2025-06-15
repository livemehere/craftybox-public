import { useQsState } from '@fewings/react-qs';
import { Space } from '@fewings/react/components';
import { ReactNode } from 'react';

import GeneralSettings from '@/features/settings/components/general';
import ShortCutSettings from '@/features/settings/components/shortcut';
import NavTabs from '@/components/NavTabs';

type SettingsQueryParams = {
  tab: 'general' | 'shortcuts';
};

const TAB: Record<SettingsQueryParams['tab'], ReactNode> = {
  general: <GeneralSettings />,
  shortcuts: <ShortCutSettings />,
};

export default function SettingsPage() {
  const [qs, setQs] = useQsState<SettingsQueryParams>({
    tab: 'general',
  });

  const tabs = Object.keys(TAB).map((key) => ({
    key,
    label: key,
  }));

  return (
    <div className={'h-full px-7 py-5'}>
      <Space y={22} />
      <NavTabs
        tabs={tabs}
        activeKey={qs.tab}
        onChange={(key) => setQs({ tab: key as SettingsQueryParams['tab'] })}
      />
      <section className={'mt-5'}>{TAB[qs.tab]}</section>
    </div>
  );
}
