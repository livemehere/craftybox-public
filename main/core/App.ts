import { app, Menu, Tray } from 'electron';
import { UpdateManager } from '@main/core/UpdateManager';
import registerStoreIpcHandlers from '@shared/Store/main';
import { config } from '@main/config';
import log from 'electron-log/main';
import { bundleModules } from '@main/modules';

import { constants } from './../constants';
import { ModuleManager } from './ModuleManager';
import { WindowManager } from './WindowManager';

const logger = log.scope('App');

export class App {
  private tray!: Tray;
  windowManager = new WindowManager();
  moduleManager = new ModuleManager(bundleModules);
  updateManager = new UpdateManager();

  private constructor() {}

  static async create() {
    const app = new App();
    await app.initialize();
    return app;
  }

  private async initialize() {
    await app.whenReady();
    await this.windowManager.initialize();
    await this.moduleManager.initialize(this);
    this.initializeTray();
    this.singleInstanceLock();
    await this.updateCheck();

    registerStoreIpcHandlers({
      onSet: (key, data) => {
        if (key === 'shortcuts') {
          this.moduleManager.reRegisterShortcuts(data);
        }
      },
    });
    logger.log('Complete initialization.');
  }

  private async updateCheck() {
    const { main, splash, snapshot } = this.windowManager;
    if (!main || !splash || !snapshot) {
      logger.error('WindowManager is not initialized');
      app.quit();
      return;
    }

    if (config.IS_DEV) {
      this.windowManager.destroySplashAndShowMain();
      logger.log('Ignore update check in dev mode.');
    } else {
      await this.updateManager.autoUpdateStart(splash, () => {
        this.windowManager.destroySplashAndShowMain();
      });
    }
  }

  private initializeTray() {
    this.tray = new Tray(constants.TRAY_ICON_IMAGE);
    this.tray.setToolTip('CraftyBox');
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show',
        type: 'normal',
        click: () => {
          this.windowManager.main.win.show();
        },
      },
      {
        label: 'Hide',
        type: 'normal',
        click: () => {
          this.windowManager.main.win.hide();
        },
      },
      {
        label: 'Quit',
        type: 'normal',
        click: () => {
          app.quit();
        },
      },
    ]);

    this.tray.setContextMenu(contextMenu);
    if (config.IS_MAC) {
      this.tray.setIgnoreDoubleClickEvents(true);
      app.dock.setMenu(contextMenu);
    } else {
      this.tray.on('double-click', () => {
        this.windowManager.main.win.show();
      });
    }
  }
  private singleInstanceLock() {
    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
      app.quit();
    } else {
      app.on('second-instance', () => {
        if (
          this.windowManager.main.win.isMinimized() ||
          !this.windowManager.main.win.isVisible()
        ) {
          this.windowManager.main.win.restore();
        }
        this.windowManager.main.win.focus();
      });
    }
  }
}
