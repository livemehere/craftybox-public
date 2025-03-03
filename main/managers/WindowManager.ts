import path, { join, resolve } from 'path';

import { app, BrowserWindow, type BrowserWindowConstructorOptions, nativeImage } from 'electron';
import { mainIpc } from '@electron-buddy/ipc/main';
import { MainConfig } from '@main/mainConfig';
import { Manager } from '@main/managers/Manager';
import { getStoreData, setStoreData } from '@shared/Store/main';
import { STORE_KEY_MAP } from '@shared/constants';

type TApp = 'index' | 'snapshot' | 'splash' | 'pin';

export class WindowManager extends Manager {
  static APP_ICON_IMG = nativeImage
    .createFromPath(
      resolve(__dirname, `${MainConfig.IS_DEV ? '../' : ''}assets/icons/${MainConfig.IS_MAC ? 'icon.png' : 'icon.ico'}`)
    )
    .resize({ width: 64, height: 64 });

  mainWindow!: BrowserWindow;
  snapshotWindow!: BrowserWindow;
  splashWindow: BrowserWindow | null = null;
  pinWindows: BrowserWindow[] = [];

  constructor() {
    super({ logScope: 'WindowManager' });
  }

  async initialize() {
    await this.createMainWindow();
    await this.createSnapshotWindow();
    await this.createSplashWindow();

    app.on('activate', async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        await this.createMainWindow();
      }
    });

    app.on('activate', async () => {
      if (!this.mainWindow) return;
      if (!MainConfig.IS_MAC) return;
      if (this.mainWindow.isVisible()) return;
      this.mainWindow.show();
    });

    app.on('window-all-closed', () => {
      app.quit();
    });
  }

  destroySplashAndShowMain() {
    this.splashWindow?.destroy();
    this.splashWindow = null;
    this.mainWindow.show();
  }

  showPinWindow(id: number) {
    const win = this.pinWindows.find((w) => w.id === id);
    if (win) {
      win.show();
    }
  }

  destroyPinWindow(id: number) {
    const win = this.pinWindows.find((w) => w.id === id);
    if (win) {
      win.destroy();
      this.pinWindows = this.pinWindows.filter((w) => w.id !== id);
    }
  }

  private async createMainWindow() {
    const bounds = getStoreData(STORE_KEY_MAP.mainBounds, { x: 0, y: 0, width: 1280, height: 720 });
    this.mainWindow = await this.createWindow(
      {
        ...bounds,
        resizable: true,
        icon: WindowManager.APP_ICON_IMG,
        show: false,
        transparent: true,
        minWidth: 1280,
        minHeight: 720
      },
      'index'
    );
    this.mainWindow.setVibrancy('fullscreen-ui');

    if (bounds.x === 0 && bounds.y === 0) {
      this.mainWindow.center();
    }

    this.mainWindow.on('close', () => {
      /* snapshot window still alive, then force quit when main window closed */
      app.quit();
    });
    this.mainWindow.on('move', () => {
      setStoreData(STORE_KEY_MAP.mainBounds, this.mainWindow.getBounds());
    });
    this.mainWindow.on('resize', () => {
      setStoreData(STORE_KEY_MAP.mainBounds, this.mainWindow.getBounds());
    });
    this.logger.info('Main window created.');
  }

  private async createSnapshotWindow() {
    this.snapshotWindow = await this.createWindow(
      {
        x: 0,
        y: 0,
        width: 100, // never mind
        height: 100, // never mind
        resizable: false,
        transparent: true,
        icon: WindowManager.APP_ICON_IMG,
        show: false
      },
      'snapshot'
    );
    this.snapshotWindow.setSkipTaskbar(true);
    this.snapshotWindow.hide();
    this.snapshotWindow.simpleFullScreen = true;
    this.logger.info('Snapshot window created.');
  }

  async addPinWindow(x: number, y: number, width: number, height: number, base64: string) {
    const win = await this.createWindow(
      {
        x,
        y,
        width,
        height,
        icon: WindowManager.APP_ICON_IMG,
        show: false,
        resizable: false
      },
      'pin'
    );
    win.setAlwaysOnTop(true, 'screen-saver');
    win.setSkipTaskbar(true);
    win.webContents.send('set-image', base64);
    this.pinWindows.push(win);
    mainIpc.send(win.webContents, 'snapshot:get', { base64, width, height, scaleFactor: 1, x, y });
    mainIpc.send(win.webContents, 'window:getId', win.id);
    this.logger.info(`Pin window created. (id:${win.id})`);
  }

  private async createSplashWindow() {
    this.splashWindow = await this.createWindow(
      {
        width: 300,
        height: 300,
        transparent: true,
        resizable: false,
        icon: WindowManager.APP_ICON_IMG,
        show: true
      },
      'splash'
    );
    this.splashWindow.center();
  }

  private async createWindow(options: BrowserWindowConstructorOptions, html: TApp) {
    const win = new BrowserWindow({
      ...options,
      frame: false,
      webPreferences: {
        preload: join(__dirname, './preload.js'),
        sandbox: false
      }
    });
    this.setupWindow(win);
    await this.loadRenderer(win, html);
    return win;
  }

  private setupWindow(win: BrowserWindow) {
    if (!MainConfig.IS_DEV) return;
    win.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'F12' && input.type === 'keyDown') {
        if (!win.webContents.isDevToolsOpened()) {
          win.webContents.openDevTools();
        } else {
          win.webContents.closeDevTools();
        }
        event.preventDefault(); // 기본 동작을 막음
      }
    });
  }

  private async loadRenderer(win: BrowserWindow, html: string) {
    if (MainConfig.IS_DEV) {
      await win.loadURL(this.getHtmlPath(html));
    } else {
      await win.loadFile(this.getHtmlPath(html));
    }
  }

  private getHtmlPath(html: string) {
    if (MainConfig.IS_DEV) {
      return `${MainConfig.RENDERER_DEV_URL}/${html}.html`;
    }
    return path.join(__dirname, `renderer/${html}.html`);
  }
}
