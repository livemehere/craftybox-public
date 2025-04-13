import { BrowserWindow, globalShortcut, screen } from 'electron';
import { Monitor } from 'node-screenshots';
import { mainIpc } from '@electron-buddy/ipc/main';
import { App } from '@main/core/App';

import { BaseModule, TModuleShortcut } from './BaseModule';

export type SnapshotModuleMessageMap = {
  'snapshot:get': {
    response: {
      base64: string;
      x: number;
      y: number;
      width: number;
      height: number;
      scaleFactor: number;
    }; // base64
  };
  'snapshot:reset': {
    response: void;
  };
};

export class SnapshotModule extends BaseModule {
  constructor(app: App) {
    super(app, 'SnapshotModule');
  }

  override getShortcuts(): TModuleShortcut[] {
    return [
      {
        key: 'shortcut:capture:cursor',
        fallbackAccelerator: 'Control+1',
        callback: this.handleCaptureWithRenderer.bind(
          this,
          this.app.windowManager.snapshot.win
        ),
      },
    ];
  }

  async registerIpcHandlers() {
    // 스냅샷 관련 IPC 핸들러 등록
  }

  getCurrentCursorMonitor() {
    const point = screen.getCursorScreenPoint();
    return Monitor.fromPoint(point.x, point.y);
  }

  handleCaptureWithRenderer(snapshotWin: BrowserWindow) {
    const monitor = this.getCurrentCursorMonitor();
    if (!monitor) {
      this.logger.error('Monitor not found');
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
