import { App } from '@main/core/App';
import { TPlatform } from '@shared/types/os-types';
import { mainIpc } from '@electron-buddy/ipc/main';
import { app, shell } from 'electron';

import { BaseModule } from './BaseModule';

export type CommonModuleInvokeMap = {
  'common:platform': {
    payload: null;
    response: TPlatform;
  };
  'common:userDataPath': {
    payload: null;
    response: string;
  };
  'common:openFile': {
    payload: string;
    response: string;
  };
  'common:openExternal': {
    payload: {
      url: string;
    };
    response: {
      success: boolean;
      error?: string;
    };
  };
};

export class CommonModule extends BaseModule {
  constructor(app: App) {
    super(app, 'CommonModule');
  }

  override async registerIpcHandlers() {
    mainIpc.handle('common:platform', async () => {
      return process.platform as TPlatform;
    });

    mainIpc.handle('common:userDataPath', async () => {
      return app.getPath('userData');
    });

    mainIpc.handle('common:openFile', async (path) => {
      return shell.openPath(path);
    });

    mainIpc.handle('common:openExternal', async ({ url }) => {
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
