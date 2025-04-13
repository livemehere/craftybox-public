import { autoUpdater } from 'electron-updater';
import { mainIpc } from '@electron-buddy/ipc/main';
import { App } from '@main/core/App';
import log from 'electron-log/main';
import { AppWindow } from '@main/core/AppWindow';

const logger = log.scope('UpdateManager');

export class UpdateManager {
  app: App;
  isUpdateAvailable = false;
  constructor(props: { app: App }) {
    this.app = props.app;
    autoUpdater.logger = logger;
    autoUpdater.disableWebInstaller = true;
  }

  async autoUpdateStart(splashWindow: AppWindow, onFinish: () => void) {
    try {
      this.setupListeners(splashWindow, onFinish);
      await autoUpdater.checkForUpdates();
    } catch (e) {
      logger.error('autoUpdater.checkForUpdates();. ' + e);
    }
  }

  private setupListeners(splashWindow: AppWindow, onFinish: () => void) {
    autoUpdater.on('checking-for-update', () => {
      logger.info('[1] Checking for update...');
      if (!splashWindow) return;
      mainIpc.send(splashWindow.win.webContents, 'update', {
        status: 'checking',
      });
    });

    autoUpdater.on('update-available', () => {
      logger.info('[1] Update available.');
      this.isUpdateAvailable = true;
      if (!splashWindow) return;
      mainIpc.send(splashWindow.win.webContents, 'update', {
        status: 'enable',
      });
    });

    autoUpdater.on('update-not-available', () => {
      logger.info('[1] Update not available.');
      this.isUpdateAvailable = false;
      if (!splashWindow) return;
      mainIpc.send(splashWindow.win.webContents, 'update', {
        status: 'disable',
      });
      onFinish();
    });

    autoUpdater.on('error', (err) => {
      logger.error('[1] Error in auto-updater. ' + err);
      if (!splashWindow) return;
      mainIpc.send(splashWindow.win.webContents, 'update', { status: 'error' });
      onFinish();
    });

    autoUpdater.on('download-progress', (progressObj) => {
      logger.info(`[1] Download progress...`);
      logger.info(progressObj);
      if (!splashWindow) return;
      mainIpc.send(splashWindow.win.webContents, 'update', {
        status: 'downloading',
        progressInfo: progressObj,
      });
    });

    autoUpdater.on('update-downloaded', (info) => {
      logger.info(`[1] Update downloaded`);
      logger.info(info);
      if (!splashWindow) return;
      mainIpc.send(splashWindow.win.webContents, 'update', { status: 'done' });
      autoUpdater.quitAndInstall(false, true);
    });
  }
}
