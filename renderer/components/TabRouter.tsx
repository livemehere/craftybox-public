import { Tab, Tabs } from '@heroui/tabs';
import { useLocation, useNavigate } from 'react-router';

import { IconKeys } from '@/components/icons/IconMap';
import { Icon } from '@/components/icons/Icon';

const TABS: {
  iconName: IconKeys;
  name: string;
  path: string;
}[] = [
  {
    iconName: 'img',
    name: 'SCREENSHOT',
    path: '/tools/screenshot',
  },
  {
    iconName: 'record',
    name: 'RECORDING',
    path: '/tools/recording',
  },
  {
    iconName: 'settings',
    name: 'SETTINGS',
    path: '/settings',
  },
];

const TabRouter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <div className={'flex items-center justify-center drop-shadow-xl'}>
      <Tabs
        color={'primary'}
        radius={'md'}
        selectedKey={location.pathname}
        onSelectionChange={(key) => {
          navigate(`${key}`, { replace: true });
        }}
      >
        {TABS.map((tab) => (
          <Tab
            key={tab.path}
            title={
              <div className={'flex items-center gap-2'}>
                <Icon name={tab.iconName} className={'scale-80'} />
                <span>{tab.name}</span>
              </div>
            }
          ></Tab>
        ))}
      </Tabs>
    </div>
  );
};

export default TabRouter;
