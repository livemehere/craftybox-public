import { shell } from 'electron';
import { App } from '@main/core/App';

import { AppModule } from './AppModule';

export class WindowModule extends AppModule {
  constructor(app: App) {
    super(app, 'WindowModule');
  }

  async registerShortcuts() {
    // 윈도우 모듈은 현재 사용하는 단축키가 없음
  }

  async registerIpcHandlers() {
    this.registerIpcHandler('window:ready', (type) => {
      switch (type) {
        case 'main':
          this.app.destroySplashAndShowMain();
          break;
        default:
          break;
      }
    });

    this.registerIpcHandler('window:hide', (winType) => {
      switch (winType) {
        case 'snapshot':
          return this.app.snapshot.win.hide();
        case 'main':
          return this.app.main.win.hide();
      }
    });

    this.registerIpcHandler('window:minimize', () => {
      return this.app.main.win.minimize();
    });

    this.registerIpcHandler('window:maximize', () => {
      if (this.app.main.win.isMaximized()) {
        return this.app.main.win.unmaximize();
      } else {
        return this.app.main.win.maximize();
      }
    });

    this.registerIpcHandler(
      'window:createPin',
      ({ x, y, width, height, base64 }) => {
        return this.app.addPinWindow(x, y, width, height, base64);
      }
    );

    this.registerIpcHandler('window:showPin', ({ id }) => {
      return this.app.showPinWindow(id);
    });

    this.registerIpcHandler('window:showMain', () => {
      return this.app.main.win.show();
    });

    this.registerIpcHandler('window:destroy', ({ id }) => {
      return this.app.destroyPinWindow(id);
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
