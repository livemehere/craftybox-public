import { shell } from 'electron';
import { App } from '@main/core/App';
import { mainIpc } from '@electron-buddy/ipc/main';

import { AppModule } from './AppModule';

export class WindowModule extends AppModule {
  constructor(app: App) {
    super(app, 'WindowModule');
  }

  async registerIpcHandlers() {
    mainIpc.handle('window:ready', async (type) => {
      switch (type) {
        case 'main':
          this.app.windowManager.destroySplashAndShowMain();
          break;
        default:
          break;
      }
    });

    mainIpc.handle('window:hide', async (winType) => {
      switch (winType) {
        case 'snapshot':
          return this.app.windowManager.snapshot.win.hide();
        case 'main':
          return this.app.windowManager.main.win.hide();
      }
    });

    mainIpc.handle('window:minimize', async () => {
      return this.app.windowManager.main.win.minimize();
    });

    mainIpc.handle('window:maximize', async () => {
      if (this.app.windowManager.main.win.isMaximized()) {
        return this.app.windowManager.main.win.unmaximize();
      } else {
        return this.app.windowManager.main.win.maximize();
      }
    });

    mainIpc.handle(
      'window:createPin',
      async ({ x, y, width, height, base64 }) => {
        return this.app.windowManager.addPinWindow(x, y, width, height, base64);
      }
    );

    mainIpc.handle('window:showPin', async ({ id }) => {
      return this.app.windowManager.showPinWindow(id);
    });

    mainIpc.handle('window:showMain', async () => {
      return this.app.windowManager.main.win.show();
    });

    mainIpc.handle('window:destroy', async ({ id }) => {
      return this.app.windowManager.destroyPinWindow(id);
    });

    mainIpc.handle('url:openExternal', async ({ url }) => {
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
