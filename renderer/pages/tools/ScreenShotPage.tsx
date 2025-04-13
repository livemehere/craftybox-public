const ScreenShotPage = () => {
  return (
    <div
      className={
        'page-wrapper-with-padding flex flex-col items-center justify-center'
      }
    >
      <h1>스크린샷</h1>
      <ul className={'typo-desc mt-2'}>
        <li>단축키를 누르면 현재 커서가 위치한 화면을 캡처합니다.</li>
      </ul>
    </div>
  );
};

export default ScreenShotPage;
