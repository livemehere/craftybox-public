import { config } from '@main/config';
import { BrowserWindow } from 'electron';
import { constants } from '@main/constants';

import { join } from 'path';

type HtmlType = 'index' | 'snapshot' | 'splash' | 'pin';
interface AppWindowConfig {
  x?: number;
  y?: number;
  height: number;
  width: number;
  html: HtmlType;
  initialShow?: boolean;
  transparent?: boolean;
  resizable?: boolean;
  useVibrancy?: boolean;
  frame?: boolean;
  skipTaskbar?: boolean;
  fullscreen?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
  alwaysOnTop?: boolean;
}

export class AppWindow {
  readonly win: BrowserWindow;
  readonly html: HtmlType;
  constructor(config: AppWindowConfig) {
    this.html = config.html;
    this.win = new BrowserWindow({
      x: config.x,
      y: config.y,
      height: config.height,
      width: config.width,
      maxWidth: config.maxWidth,
      maxHeight: config.maxHeight,
      minWidth: config.minWidth,
      minHeight: config.minHeight,
      icon: constants.WINDOW_ICON_IMAGE,
      frame: config.frame,
      transparent: config.transparent,
      resizable: config.resizable,
      show: config.initialShow,
      webPreferences: {
        preload: join(__dirname, './preload.js'),
        sandbox: false,
      },
    });
    if (config.skipTaskbar) {
      this.win.setSkipTaskbar(true);
    }
    if (config.useVibrancy) {
      this.win.setVibrancy('fullscreen-ui');
    }
    if (config.alwaysOnTop) {
      this.win.setAlwaysOnTop(true, 'screen-saver');
    }
    if (!config.x && !config.y) {
      this.win.center();
    }
    if (config.fullscreen) {
      this.win.setSimpleFullScreen(true);
    }
  }

  static async create(config: AppWindowConfig) {
    const win = new AppWindow(config);
    win.setupDevTools();
    await win.loadHTML();
    return win;
  }

  private setupDevTools() {
    if (!config.IS_DEV) return;
    this.win.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'F12' && input.type === 'keyDown') {
        if (!this.win.webContents.isDevToolsOpened()) {
          this.win.webContents.openDevTools();
        } else {
          this.win.webContents.closeDevTools();
        }
      }

      if (
        (input.meta || input.control) &&
        input.code === 'KeyC' &&
        input.shift
      ) {
        this.win.webContents.devToolsWebContents?.executeJavaScript(
          'DevToolsAPI.enterInspectElementMode()'
        );
      }
    });
  }

  private async loadHTML() {
    if (config.IS_DEV) {
      await this.win.loadURL(this.getHtmlPath());
    } else {
      await this.win.loadFile(this.getHtmlPath());
    }
  }

  /**
   * `__dirname` is `dist/main.js`
   */
  private getHtmlPath() {
    return config.IS_DEV
      ? `${config.RENDERER_DEV_URL}/${this.html}.html`
      : join(__dirname, `renderer/${this.html}.html`);
  }
}
