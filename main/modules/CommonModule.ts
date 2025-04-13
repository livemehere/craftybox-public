import { App } from '@main/core/App';
import { TPlatform } from '@shared/types/os-types';
import { mainIpc } from '@electron-buddy/ipc/main';
import { app, shell } from 'electron';

import { AppModule } from './AppModule';

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
};

export class CommonModule extends AppModule {
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
  }
}
