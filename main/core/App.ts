import {
  app,
  BrowserWindow,
  globalShortcut,
  Menu,
  nativeImage,
  Tray,
} from 'electron';
import { UpdateManager } from '@main/core/UpdateManager';
import { IModule } from '@main/modules/BaseModule';
import { TShortcutKeys, Shortcuts } from '@shared/types/shortcut-types';
import { STORE_KEY_MAP } from '@shared/constants';
import { getStoreData, setStoreData } from '@shared/Store/main';
import registerStoreIpcHandlers from '@shared/Store/main';
import { mainIpc } from '@electron-buddy/ipc/main';
import { config } from '@main/config';
import log from 'electron-log/main';
import { bundleModules } from '@main/modules';

import { resolve } from 'path';

import { AppWindow } from './AppWindow';

export class App {
  private logger = log.scope('App');
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

  private moduleMap = new Map<string, IModule>();

  private readonly defaultShortcuts: Shortcuts = [
    {
      key: 'capture:cursor',
      value: 'Control+1',
      label: '캡쳐하기',
      enabled: true,
      description: '현재 마우스 커서가 위치한 모니터를 캡쳐합니다.',
    },
    {
      key: 'color-picker:open',
      value: 'Control+2',
      label: '색상 추출',
      enabled: true,
      description: '현재 마우스 커서가 위치한 화면의 색상을 추출합니다.',
    },
  ];

  private constructor() {}

  static async create() {
    const appManager = new App();
    await appManager.initialize();
    return appManager;
  }

  private async initialize() {
    await app.whenReady();
    await this.setupWindows();

    this.updateManager = new UpdateManager({ app: this });
    if (config.IS_DEV) {
      this.destroySplashAndShowMain();
    } else {
      await this.updateManager.autoUpdateStart(this.splash!, () => {
        this.destroySplashAndShowMain();
      });
    }

    this.initializeModules();
    this.initializeShortcuts();
    this.registerShortcutIpcHandlers();
    this.setupTray();

    this.singleInstanceLock();
    this.logger.info('App initialized.');
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
    this.logger.info('Main window created.');
  }
  private async createSplashWindow() {
    this.splash = await AppWindow.create({
      width: 300,
      height: 300,
      transparent: true,
      resizable: false,
      html: 'splash',
    });
    this.logger.info('Splash window created.');
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
    this.logger.info('Snapshot window created.');
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
    this.logger.info(`Pin window created. (id:${id})`);
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
    const promises = [];
    for (const Module of bundleModules) {
      const instance = new Module(this);
      promises.push(instance.initialize());
      this.moduleMap.set(instance.name, instance);
    }
    await Promise.all(promises);
  }

  private initializeShortcuts(): void {
    const storedShortcuts = getStoreData<Shortcuts>(
      STORE_KEY_MAP.shortcuts,
      this.defaultShortcuts
    );
    const mergedShortcuts = this.mergeWithDefaults(storedShortcuts);

    setStoreData(STORE_KEY_MAP.shortcuts, mergedShortcuts);

    registerStoreIpcHandlers({
      onSet: (key, data) => {
        if (key.includes('shortcuts')) {
          this.registerGlobalShortcuts(data as Shortcuts);
        }
      },
    });
  }

  private registerShortcutIpcHandlers(): void {
    // shortcut:set IPC 핸들러 등록
    mainIpc.handle(
      'shortcut:set',
      ({ key, register }: { key: TShortcutKeys; register: boolean }) =>
        this.toggleShortcut(key, register)
    );
  }

  private registerGlobalShortcuts(shortcuts: Shortcuts): void {
    globalShortcut.unregisterAll();

    shortcuts.forEach((shortcut) => {
      if (!shortcut.enabled) return;

      try {
        // 모든 모듈에서 단축키 핸들러 찾기
        let handler: (() => void) | undefined;

        for (const module of this.modules.values()) {
          const moduleHandlers = module.getShortcutHandlers();
          if (moduleHandlers[shortcut.key]) {
            handler = moduleHandlers[shortcut.key];
            break;
          }
        }

        if (handler) {
          globalShortcut.register(shortcut.value, handler);
          this.logger.info(
            `Registered shortcut: ${shortcut.value} for ${shortcut.key}`
          );
        }
      } catch (error) {
        this.logger.error(`단축키 등록 실패: ${shortcut.value}`, error);
      }
    });
  }

  private async toggleShortcut(
    key: TShortcutKeys,
    enabled: boolean
  ): Promise<void> {
    const shortcuts = getStoreData<Shortcuts>(
      STORE_KEY_MAP.shortcuts,
      this.defaultShortcuts
    );
    const targetShortcut = shortcuts.find((shortcut) => shortcut.key === key);

    if (!targetShortcut) return;

    const updatedShortcuts = shortcuts.map((shortcut) =>
      shortcut.key === key ? { ...shortcut, enabled } : shortcut
    );

    setStoreData(STORE_KEY_MAP.shortcuts, updatedShortcuts);
    this.registerGlobalShortcuts(updatedShortcuts);
  }

  private mergeWithDefaults(storedShortcuts: Shortcuts): Shortcuts {
    return this.defaultShortcuts.map((defaultShortcut) => {
      const userShortcut = storedShortcuts.find(
        (shortcut) => shortcut.key === defaultShortcut.key
      );

      if (!userShortcut) {
        return defaultShortcut;
      }

      return {
        ...defaultShortcut,
        ...userShortcut,
      };
    });
  }
}
