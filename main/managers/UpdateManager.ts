import { autoUpdater } from 'electron-updater';
import { mainIpc } from '@electron-buddy/ipc/main';
import { MainConfig } from '@main/mainConfig';
import { Manager } from '@main/managers/Manager';
import { AppManager } from '@main/managers/AppManager';

export class UpdateManager extends Manager {
  app: AppManager;
  isUpdateAvailable = false;

  constructor(props: { app: AppManager }) {
    super({ logScope: 'UpdateManager' });
    this.app = props.app;

    autoUpdater.logger = this.logger;

    autoUpdater.disableWebInstaller = true;
  }

  async autoUpdateStart() {
    const { windowManager } = this.app;
    if (MainConfig.IS_DEV) {
      this.logger.info('Development mode. Skip auto update.');
      windowManager.destroySplashAndShowMain();
      return;
    }
    try {
      this.setupListeners();
      await autoUpdater.checkForUpdates();
    } catch (e) {
      this.logger.error('autoUpdater.checkForUpdates();. ' + e);
    }
  }

  private setupListeners() {
    const {
      windowManager: { splashWindow, destroySplashAndShowMain }
    } = this.app;

    autoUpdater.on('checking-for-update', () => {
      this.logger.info('[1] Checking for update...');
      if (!splashWindow) return;
      mainIpc.send(splashWindow.webContents, 'update', { status: 'checking' });
    });

    autoUpdater.on('update-available', () => {
      this.logger.info('[1] Update available.');
      this.isUpdateAvailable = true;
      if (!splashWindow) return;
      mainIpc.send(splashWindow.webContents, 'update', { status: 'enable' });
    });

    autoUpdater.on('update-not-available', () => {
      this.logger.info('[1] Update not available.');
      this.isUpdateAvailable = false;
      if (!splashWindow) return;
      mainIpc.send(splashWindow.webContents, 'update', { status: 'disable' });
      destroySplashAndShowMain();
    });

    autoUpdater.on('error', (err) => {
      this.logger.error('[1] Error in auto-updater. ' + err);
      if (!splashWindow) return;
      mainIpc.send(splashWindow.webContents, 'update', { status: 'error' });
      destroySplashAndShowMain();
    });

    autoUpdater.on('download-progress', (progressObj) => {
      this.logger.info(`[1] Download progress...`);
      this.logger.info(progressObj);
      if (!splashWindow) return;
      mainIpc.send(splashWindow.webContents, 'update', { status: 'downloading', progressInfo: progressObj });
    });

    autoUpdater.on('update-downloaded', (info) => {
      this.logger.info(`[1] Update downloaded`);
      this.logger.info(info);
      if (!splashWindow) return;
      mainIpc.send(splashWindow.webContents, 'update', { status: 'done' });
      autoUpdater.quitAndInstall(false, true);
    });
  }
}
