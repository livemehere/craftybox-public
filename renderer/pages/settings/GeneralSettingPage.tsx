import { PKG_JSON } from '@shared/constants';

import SettingItem from '@/features/settings/components/SettingItem';

const GeneralSettingPage = () => {
  return (
    <div className={'page-wrapper-with-padding'}>
      <SettingItem title={`Version`}>{PKG_JSON.version}</SettingItem>
    </div>
  );
};

export default GeneralSettingPage;
