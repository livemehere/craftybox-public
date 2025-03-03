import { mainIpc } from '@electron-buddy/ipc/main';
import { AppManager } from '@main/managers/AppManager';
import { Manager } from '@main/managers/Manager';
import { TPlatform } from '@shared/types/os-types';

export class IpcManager extends Manager {
  app: AppManager;
  constructor({ app }: { app: AppManager }) {
    super({ logScope: 'IpcManager' });
    this.app = app;
    this.registerWindowHandlers();
  }

  private registerWindowHandlers() {
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
          return this.app.windowManager.snapshotWindow.hide();
        case 'main':
          return this.app.windowManager.mainWindow.hide();
      }
    });

    mainIpc.handle('window:minimize', async () => {
      return this.app.windowManager.mainWindow.minimize();
    });

    mainIpc.handle('window:maximize', async () => {
      if (this.app.windowManager.mainWindow.isMaximized()) {
        return this.app.windowManager.mainWindow.unmaximize();
      } else {
        return this.app.windowManager.mainWindow.maximize();
      }
    });

    mainIpc.handle('platform:get', async () => {
      return process.platform as TPlatform;
    });

    mainIpc.handle('window:createPin', async ({ x, y, width, height, base64 }) => {
      return this.app.windowManager.addPinWindow(x, y, width, height, base64);
    });

    mainIpc.handle('window:showPin', async ({ id }) => {
      return this.app.windowManager.showPinWindow(id);
    });

    mainIpc.handle('window:showMain', async () => {
      return this.app.windowManager.mainWindow.show();
    });

    mainIpc.handle('window:destroy', async ({ id }) => {
      return this.app.windowManager.destroyPinWindow(id);
    });
  }
}
