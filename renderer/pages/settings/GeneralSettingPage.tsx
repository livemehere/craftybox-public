import { PKG_JSON } from '@shared/constants';

import SettingItem from '@/features/settings/components/SettingItem';
import WithBreadcrumb from '@/components/WithBreadcrumb';

const GeneralSettingPage = () => {
  return (
    <WithBreadcrumb
      items={[
        { name: '설정', path: '/settings' },
        {
          name: '일반',
          path: '/settings'
        }
      ]}
    >
      <div className={'page-wrapper-with-padding'}>
        <SettingItem title={`Version`}>{PKG_JSON.version}</SettingItem>
      </div>
    </WithBreadcrumb>
  );
};

export default GeneralSettingPage;
