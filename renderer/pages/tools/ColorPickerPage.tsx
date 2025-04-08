import WithBreadcrumb from '@/components/WithBreadcrumb';

const ColorPickerPage = () => {
  return (
    <WithBreadcrumb
      items={[
        { name: '도구', path: '/tools' },
        { name: 'color picker', path: '/tools/color-picker' },
      ]}
    >
      <div
        className={'page-wrapper-with-padding flex items-center justify-center'}
      >
        <h1>COMING SOON</h1>
      </div>
    </WithBreadcrumb>
  );
};

export default ColorPickerPage;
