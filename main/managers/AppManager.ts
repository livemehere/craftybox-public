import { app } from 'electron';
import { WindowManager } from '@main/managers/WindowManager';
import { UpdateManager } from '@main/managers/UpdateManager';
import { TrayManager } from '@main/managers/TrayManager';
import { IpcManager } from '@main/managers/IpcManager';
import { ShortcutManager } from '@main/managers/ShortcutManager';
import { Manager } from '@main/managers/Manager';
import { SnapshotModule } from '@main/modules/snapshotModule';

export class AppManager extends Manager {
  updateManager!: UpdateManager;
  trayManager!: TrayManager;
  windowManager!: WindowManager;
  ipcManager!: IpcManager;
  shortcutManager!: ShortcutManager;

  /* modules */
  snapshotModule!: SnapshotModule;

  private constructor() {
    super({ logScope: 'AppManager' });
  }

  static async create() {
    const appManager = new AppManager();
    await appManager.initialize();
    return appManager;
  }

  private async initialize() {
    await app.whenReady();

    this.ipcManager = new IpcManager({ app: this });

    this.windowManager = new WindowManager();
    await this.windowManager.initialize();

    this.updateManager = new UpdateManager({ app: this });
    await this.updateManager.autoUpdateStart();

    this.trayManager = new TrayManager({ app: this });
    this.shortcutManager = new ShortcutManager({ app: this });

    this.setUpModules();

    this.singleInstanceLock();
    this.logger.info('App initialized.');
  }

  private singleInstanceLock() {
    const gotTheLock = app.requestSingleInstanceLock();

    if (!gotTheLock) {
      app.quit();
    } else {
      const { mainWindow } = this.windowManager;
      app.on('second-instance', () => {
        if (mainWindow.isMinimized() || !mainWindow.isVisible()) {
          mainWindow.restore();
        }
        mainWindow.focus();
      });
    }
  }

  private setUpModules() {
    this.snapshotModule = new SnapshotModule();
  }
}
