import { useQsState } from '@fewings/react-qs';
import { Space } from '@fewings/react/components';
import { ReactNode } from 'react';

import GeneralSettings from '@/features/Settings-General/components/GeneralSettings';
import ShortCutSettings from '@/features/Settings-Shortcut/components/ShortCutSettings';
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
    <div className={'h-full px-30 py-20'}>
      <h1 className={'heading1'}>Settings</h1>
      <Space y={22} />
      <NavTabs
        tabs={tabs}
        activeKey={qs.tab}
        onChange={(key) => setQs({ tab: key as SettingsQueryParams['tab'] })}
      />
      <section className={'mt-20'}>{TAB[qs.tab]}</section>
    </div>
  );
}
