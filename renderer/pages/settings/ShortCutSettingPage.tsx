import WithBreadcrumb from '@/components/WithBreadcrumb';
import ShortcutList from '@/features/settings/components/shortcuts/ShortcutList';

const ShortCutSettingPage = () => {
  return (
    <WithBreadcrumb
      items={[
        { name: '설정', path: '/settings' },
        { name: '단축키', path: '/settings/shortcuts' }
      ]}
    >
      <div className={'page-wrapper-with-padding'}>
        <ShortcutList />
      </div>
    </WithBreadcrumb>
  );
};

export default ShortCutSettingPage;
