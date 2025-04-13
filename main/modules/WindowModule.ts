import { App } from '@main/core/App';
import { mainIpc } from '@electron-buddy/ipc/main';

import { BaseModule } from './BaseModule';

export type WindowModuleInvokeMap = {
  'window:ready': {
    payload: 'main';
    response: void;
  };
  'window:hide': {
    payload: 'snapshot' | 'main';
    response: void;
  };
  'window:destroyPin': {
    payload: {
      id: number;
    };
    response: void;
  };
  'window:minimize': {
    payload: null;
    response: void;
  };
  'window:maximize': {
    payload: null;
    response: void;
  };
  'window:createPin': {
    payload: {
      x: number;
      y: number;
      width: number;
      height: number;
      base64: string;
    };
    response: void;
  };
  'window:showPin': {
    payload: {
      id: number;
    };
    response: void;
  };
  'window:showMain': {
    payload: null;
    response: void;
  };
};

export class WindowModule extends BaseModule {
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

    mainIpc.handle('window:destroyPin', async ({ id }) => {
      return this.app.windowManager.destroyPinWindow(id);
    });
  }
}
