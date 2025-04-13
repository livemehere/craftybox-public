import { getStoreData } from '@shared/Store/main';
import { app, BrowserWindow } from 'electron';
import { STORE_KEY_MAP } from '@shared/constants';
import { setStoreData } from '@shared/Store/main';
import { config } from '@main/config';
import { mainIpc } from '@electron-buddy/ipc/main';

import { AppWindow } from './AppWindow';

export class WindowManager {
  splash: AppWindow | null = null;
  main!: AppWindow;
  snapshot!: AppWindow;
  pins: AppWindow[] = [];
  constructor() {}

  async initialize() {
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
}
