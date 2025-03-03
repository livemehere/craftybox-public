import { rendererIpc } from '@electron-buddy/ipc/renderer';

let id: number;

rendererIpc.on('window:getId', (winId) => {
  id = winId;
  rendererIpc.invoke('window:showPin', { id });
});

rendererIpc.on('snapshot:get', (e) => {
  const img = document.createElement('img');
  img.src = e.base64;
  document.body.appendChild(img);
});

const closeBtn = document.querySelector('button') as HTMLButtonElement;
closeBtn.addEventListener('click', () => {
  if (!id) return;
  rendererIpc.invoke('window:destroy', {
    id
  });
});

window.addEventListener('beforeunload', () => {
  rendererIpc.invoke('window:destroy', {
    id
  });
});
