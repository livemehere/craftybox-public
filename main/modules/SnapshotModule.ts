import { BrowserWindow, globalShortcut, screen } from 'electron';
import { Monitor } from 'node-screenshots';
import { mainIpc } from '@electron-buddy/ipc/main';
import { App } from '@main/core/App';
import { Shortcuts } from '@shared/types/shortcut-types';
import { STORE_KEY_MAP } from '@shared/constants';
import { getStoreData } from '@shared/Store/main';

import { BaseModule } from './BaseModule';

export class SnapshotModule extends BaseModule {
  constructor(appManager: App) {
    super(appManager, 'SnapshotModule');
    this.shortcutHandlers = {
      'capture:cursor': this.handleCaptureWithRenderer.bind(
        this,
        appManager.snapshot.win
      ),
    };
  }

  initialize(): void {
    this.registerIpcHandlers();
    this.registerShortcuts();
  }

  registerIpcHandlers(): void {
    // 스냅샷 관련 IPC 핸들러 등록
  }

  registerShortcuts(): void {
    const shortcuts = getStoreData<Shortcuts>(STORE_KEY_MAP.shortcuts, []);

    const captureShortcut = shortcuts.find(
      (shortcut) => shortcut.key === 'capture:cursor' && shortcut.enabled
    );

    if (captureShortcut) {
      this.registerShortcut(
        captureShortcut.value,
        this.shortcutHandlers['capture:cursor']!
      );
    }
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
