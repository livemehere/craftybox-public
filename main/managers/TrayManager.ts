import { app, Menu, nativeImage, Tray } from 'electron';
import { MainConfig } from '@main/mainConfig';
import { Manager } from '@main/managers/Manager';
import { AppManager } from '@main/managers/AppManager';

import { resolve } from 'path';

export class TrayManager extends Manager {
  private static TRAY_ICON = nativeImage
    .createFromPath(
      resolve(
        __dirname,
        `${MainConfig.IS_DEV ? '../' : ''}assets/icons/${MainConfig.IS_MAC ? 'iconTemplate.png' : 'icon.ico'}`
      )
    )
    .resize({ width: 24, height: 24 });

  app: AppManager;
  tray: Tray;

  constructor(props: { app: AppManager }) {
    super({ logScope: 'TrayManager' });
    this.app = props.app;
    this.tray = new Tray(TrayManager.TRAY_ICON);
    this.initialize();
  }

  initialize() {
    const { windowManager } = this.app;
    this.tray.setToolTip('CraftyBox');
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show',
        type: 'normal',
        click: () => {
          windowManager.mainWindow.show();
        },
      },
      {
        label: 'Hide',
        type: 'normal',
        click: () => {
          windowManager.mainWindow.hide();
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
    if (MainConfig.IS_MAC) {
      this.tray.setIgnoreDoubleClickEvents(true);
      app.dock.setMenu(contextMenu);
    } else {
      this.tray.on('double-click', () => {
        windowManager.mainWindow.show();
      });
    }
  }
}
