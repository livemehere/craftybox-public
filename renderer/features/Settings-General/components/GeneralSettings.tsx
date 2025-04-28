import { PKG_JSON } from '@shared/constants';

import SettingItem from '@/features/Settings-General/components/SettingItem';

export default function GeneralSettings() {
  return (
    <div className="space-y-4">
      <SettingItem title={`Version`}>{PKG_JSON.version}</SettingItem>
    </div>
  );
}
