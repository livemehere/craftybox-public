import {
  app,
  BrowserWindow,
  globalShortcut,
  Menu,
  nativeImage,
  Tray,
} from 'electron';
import { UpdateManager } from '@main/core/UpdateManager';
import { AppModule, TModuleShortcut } from '@main/modules/AppModule';
import { TUserShortcutSettings } from '@shared/types/shortcut-types';
import { STORE_KEY_MAP } from '@shared/constants';
import { getStoreData, setStoreData } from '@shared/Store/main';
import registerStoreIpcHandlers from '@shared/Store/main';
import { mainIpc } from '@electron-buddy/ipc/main';
import { config } from '@main/config';
import log from 'electron-log/main';
import { ColorPickerModule } from '@main/modules/ColorPickerModule';
import { PlatformModule } from '@main/modules/PlatformModule';
import { SnapshotModule } from '@main/modules/SnapshotModule';
import { WindowModule } from '@main/modules/WindowModule';

import { resolve } from 'path';

import { AppWindow } from './AppWindow';

const logger = log.scope('App');

export class App {
  private static trayIcon = nativeImage
    .createFromPath(
      resolve(
        __dirname,
        `${config.IS_DEV ? '../' : ''}assets/icons/${config.IS_MAC ? 'iconTemplate.png' : 'icon.ico'}`
      )
    )
    .resize({ width: 24, height: 24 });

  private tray!: Tray;

  splash: AppWindow | null = null;
  main!: AppWindow;
  snapshot!: AppWindow;
  pins: AppWindow[] = [];

  updateManager!: UpdateManager;

  modules: AppModule[] = [
    new PlatformModule(this),
    new SnapshotModule(this),
    new WindowModule(this),
    new ColorPickerModule(this),
  ];

  private constructor() {}

  static async create() {
    const appManager = new App();
    await appManager.initialize();
    return appManager;
  }

  private async initialize() {
    await app.whenReady();
    logger.log('App ready.');
    await this.setupWindows();
    logger.log('Windows setup complete.');
    this.singleInstanceLock();

    this.updateManager = new UpdateManager({ app: this });
    if (config.IS_DEV) {
      this.destroySplashAndShowMain();
      logger.log('Ignore update check in dev mode.');
    } else {
      logger.log('Starting auto update check...');
      await this.updateManager.autoUpdateStart(this.splash!, () => {
        this.destroySplashAndShowMain();
      });
      logger.log('Auto update check complete.');
    }

    this.setupTray();
    logger.log('Tray setup complete.');
    this.initializeModules();
    logger.log('Modules initialized.');
    registerStoreIpcHandlers({
      onSet: (key, data) => {
        if (key === 'shortcuts') {
          logger.log('Module shortcuts update started.');
          globalShortcut.unregisterAll();
          for (const Module of this.modules) {
            this.registerModuleShortcuts(Module.getShortcuts(), data);
          }
          logger.log('Module shortcuts update complete.');
        }
      },
    });
    logger.log('Complete initialization.');
  }

  destroySplashAndShowMain() {
    this.splash?.win.destroy();
    this.splash = null;
    this.main.win.show();
  }
  showPinWindow(id: number) {
    const win = this.pins.find((w) => w.win.id === id);
    if (win) {
      win.win.show();
    }
  }

  destroyPinWindow(id: number) {
    const win = this.pins.find((w) => w.win.id === id);
    if (win) {
      win.win.destroy();
      this.pins = this.pins.filter((w) => w.win.id !== id);
    }
  }

  private async createMainWindow() {
    const bounds = getStoreData(STORE_KEY_MAP.mainBounds, {
      x: 0,
      y: 0,
      width: 1280,
      height: 720,
    });
    this.main = await AppWindow.create({
      ...bounds,
      transparent: true,
      resizable: true,
      initialShow: false,
      html: 'index',
    });
    this.main.win.on('close', () => {
      /* snapshot window still alive, then force quit when main window closed */
      app.quit();
    });
    this.main.win.on('move', () => {
      setStoreData(STORE_KEY_MAP.mainBounds, this.main.win.getBounds());
    });
    this.main.win.on('resize', () => {
      setStoreData(STORE_KEY_MAP.mainBounds, this.main.win.getBounds());
    });
  }
  private async createSplashWindow() {
    this.splash = await AppWindow.create({
      width: 300,
      height: 300,
      transparent: true,
      resizable: false,
      html: 'splash',
    });
  }
  private async createSnapshotWindow() {
    this.snapshot = await AppWindow.create({
      width: 0,
      height: 0,
      resizable: false,
      transparent: true,
      skipTaskbar: true,
      initialShow: false,
      fullscreen: true,
      html: 'snapshot',
    });
  }
  async addPinWindow(
    x: number,
    y: number,
    width: number,
    height: number,
    base64: string
  ) {
    const appWin = await AppWindow.create({
      x,
      y,
      width,
      height,
      html: 'pin',
      alwaysOnTop: true,
      skipTaskbar: true,
    });
    appWin.win.webContents.send('set-image', base64);
    this.pins.push(appWin);
    mainIpc.send(appWin.win.webContents, 'snapshot:get', {
      base64,
      width,
      height,
      scaleFactor: 1,
      x,
      y,
    });
    const id = appWin.win.id;
    mainIpc.send(appWin.win.webContents, 'window:getId', id);
  }
  private async setupWindows() {
    await this.createMainWindow();
    await this.createSplashWindow();
    await this.createSnapshotWindow();
    app.on('activate', async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        await this.createMainWindow();
      }
    });

    app.on('activate', async () => {
      if (!this.main) return;
      if (!config.IS_MAC) return;
      if (this.main.win.isVisible()) return;
      this.main.win.show();
    });

    app.on('window-all-closed', () => {
      app.quit();
    });
  }
  private setupTray() {
    this.tray = new Tray(App.trayIcon);
    this.tray.setToolTip('CraftyBox');
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show',
        type: 'normal',
        click: () => {
          this.main.win.show();
        },
      },
      {
        label: 'Hide',
        type: 'normal',
        click: () => {
          this.main.win.hide();
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
        this.main.win.show();
      });
    }
  }
  private singleInstanceLock() {
    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
      app.quit();
    } else {
      app.on('second-instance', () => {
        if (this.main.win.isMinimized() || !this.main.win.isVisible()) {
          this.main.win.restore();
        }
        this.main.win.focus();
      });
    }
  }

  private async initializeModules() {
    const userSettings = getStoreData<TUserShortcutSettings>(
      STORE_KEY_MAP.shortcuts,
      []
    );
    const promises = [];
    for (const Module of this.modules) {
      const promise = async () => {
        await Module.initialize();
        await Module.registerIpcHandlers();
        this.registerModuleShortcuts(Module.getShortcuts(), userSettings);
      };
      promises.push(promise);
    }
    await Promise.all(promises);
  }

  private registerModuleShortcuts(
    shortcuts: TModuleShortcut[],
    userSettings: TUserShortcutSettings
  ): void {
    for (const shortcut of shortcuts) {
      const userSetting = userSettings.find((u) => u.key === shortcut.key);
      const accelerator = userSetting?.value ?? shortcut.fallbackAccelerator;
      const disabled = userSetting && !userSetting.enabled;
      if (disabled) continue;
      try {
        globalShortcut.register(accelerator, shortcut.callback);
        logger.log(
          `${shortcut.key}(${accelerator}) : ${userSetting?.enabled ? 'enabled' : 'disabled'}`
        );
      } catch (error) {
        logger.log(`Failed to change ${shortcut.key}: ${accelerator}`, error);
      }
    }
  }
}
