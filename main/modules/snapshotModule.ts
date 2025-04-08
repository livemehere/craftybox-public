import { BrowserWindow, globalShortcut, screen } from 'electron';
import { Monitor } from 'node-screenshots';
import { mainIpc } from '@electron-buddy/ipc/main';

export class SnapshotModule {
  constructor() {}

  getCurrentCursorMonitor() {
    const point = screen.getCursorScreenPoint();
    return Monitor.fromPoint(point.x, point.y);
  }

  handleCaptureWithRenderer(snapshotWin: BrowserWindow) {
    const monitor = this.getCurrentCursorMonitor();
    if (!monitor) {
      alert('monitor not found');
      return;
    }
    const image = monitor?.captureImageSync();
    const buffer = image.toPngSync();
    const base64 = `data:image/png;base64,${buffer.toString('base64')}`;

    snapshotWin.setBounds({
      x: monitor.x,
      y: monitor.y,
      width: monitor.width,
      height: monitor.height,
    });

    mainIpc.send(snapshotWin.webContents, 'snapshot:get', {
      base64,
      x: monitor.x,
      y: monitor.y,
      width: monitor.width,
      height: monitor.height,
      scaleFactor: monitor.scaleFactor,
    });

    globalShortcut.register('esc', () => {
      snapshotWin.hide();
      mainIpc.send(snapshotWin.webContents, 'snapshot:reset', void 0);
      globalShortcut.unregister('esc');
    });

    snapshotWin.show();
    setImmediate(() => {
      snapshotWin.focus();
    });
  }
}
