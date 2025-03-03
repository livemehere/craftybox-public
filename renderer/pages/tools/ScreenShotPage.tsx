import WithBreadcrumb from '@/components/WithBreadcrumb';

const ScreenShotPage = () => {
  return (
    <WithBreadcrumb
      items={[
        { name: '도구', path: '/tools' },
        { name: '스크린샷', path: '/tools/screenshot' }
      ]}
    >
      <div className={'page-wrapper-with-padding flex flex-col items-center justify-center'}>
        <h1>스크린샷</h1>
        <ul className={'typo-desc mt-2'}>
          <li>단축키를 누르면 현재 커서가 위치한 화면을 캡처합니다.</li>
        </ul>
      </div>
    </WithBreadcrumb>
  );
};

export default ScreenShotPage;
