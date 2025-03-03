import { rendererIpc } from '@electron-buddy/ipc/renderer';

const bar = document.querySelector('.bar') as HTMLElement;
const progress = document.querySelector('.progress') as HTMLElement;

const status = document.querySelector('.status') as HTMLElement;
const msg = document.querySelector('.msg') as HTMLElement;
const cur = document.querySelector('.cur') as HTMLElement;
const total = document.querySelector('.total') as HTMLElement;
const per = document.querySelector('.per') as HTMLElement;

rendererIpc.on('update', (e) => {
  switch (e.status) {
    case 'checking':
      bar.style.display = 'none';
      status.style.display = 'none';
      msg.innerText = '업데이트 확인중...';
      break;
    case 'enable':
      msg.innerText = '업데이트를 시작합니다...';
      break;
    case 'disable':
      msg.innerText = '최신 버전입니다!';
      break;
    case 'done':
      msg.innerText = '설치를 시작합니다...';
      break;
    case 'downloading':
      msg.innerText = '다운로드중...';
      status.style.display = 'block';
      bar.style.display = 'block';

      progress.style.width = `${e.progressInfo!.percent.toFixed(0)}%`;
      cur.innerText = `${bytesToMb(e.progressInfo!.transferred).toFixed(0)}MB`;
      total.innerText = `${bytesToMb(e.progressInfo!.total).toFixed(0)}MB`;
      per.innerText = `(${bytesToMb(e.progressInfo!.bytesPerSecond).toFixed(0)}MB/sec)`;
      break;
    case 'error':
      msg.innerText = '업데이트 실패';
      rendererIpc.invoke('window:ready', 'main');
      break;
    default:
      break;
  }
});

function bytesToMb(bytes: number): number {
  if (bytes < 0) {
    return 0;
  }
  return bytes / (1024 * 1024);
}
