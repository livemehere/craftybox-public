import { shell } from 'electron';
import { App } from '@main/core/App';

import { BaseModule } from './BaseModule';

export class WindowModule extends BaseModule {
  constructor(appManager: App) {
    super(appManager, 'WindowModule');
  }

  initialize(): void {
    this.registerIpcHandlers();
    this.registerShortcuts();
  }

  registerShortcuts(): void {
    // 윈도우 모듈은 현재 사용하는 단축키가 없음
  }

  registerIpcHandlers(): void {
    this.registerIpcHandler('window:ready', (type) => {
      switch (type) {
        case 'main':
          this.appManager.destroySplashAndShowMain();
          break;
        default:
          break;
      }
    });

    this.registerIpcHandler('window:hide', (winType) => {
      switch (winType) {
        case 'snapshot':
          return this.appManager.snapshot.win.hide();
        case 'main':
          return this.appManager.main.win.hide();
      }
    });

    this.registerIpcHandler('window:minimize', () => {
      return this.appManager.main.win.minimize();
    });

    this.registerIpcHandler('window:maximize', () => {
      if (this.appManager.main.win.isMaximized()) {
        return this.appManager.main.win.unmaximize();
      } else {
        return this.appManager.main.win.maximize();
      }
    });

    this.registerIpcHandler(
      'window:createPin',
      ({ x, y, width, height, base64 }) => {
        return this.appManager.addPinWindow(x, y, width, height, base64);
      }
    );

    this.registerIpcHandler('window:showPin', ({ id }) => {
      return this.appManager.showPinWindow(id);
    });

    this.registerIpcHandler('window:showMain', () => {
      return this.appManager.main.win.show();
    });

    this.registerIpcHandler('window:destroy', ({ id }) => {
      return this.appManager.destroyPinWindow(id);
    });

    this.registerIpcHandler('url:openExternal', ({ url }) => {
      return shell
        .openExternal(url)
        .then(() => ({ success: true }))
        .catch((error) => {
          this.logger.error('Failed to open URL in external browser', error);
          return { success: false, error: (error as Error).message };
        });
    });
  }
}
