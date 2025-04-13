import { App } from '@main/core/App';
import { mainIpc } from '@electron-buddy/ipc/main';
import { TUserShortcutSettings } from '@shared/types/shortcut-types';
import { STORE_KEY_MAP } from '@shared/constants';
import { getStoreData } from '@shared/Store/main';

import { AppModule } from './AppModule';

export class ColorPickerModule extends AppModule {
  constructor(app: App) {
    super(app, 'ColorPickerModule');
    this.shortcutHandlers = {
      'color-picker:open': this.openColorPicker.bind(this),
    };
  }

  async registerIpcHandlers() {
    // 컬러 피커 관련 IPC 핸들러가 필요한 경우 여기에 추가
  }

  async registerShortcuts() {
    const shortcuts = getStoreData<TUserShortcutSettings>(
      STORE_KEY_MAP.shortcuts,
      []
    );

    const colorPickerShortcut = shortcuts.find(
      (shortcut) => shortcut.key === 'color-picker:open' && shortcut.enabled
    );

    if (colorPickerShortcut) {
      this.registerShortcut(
        colorPickerShortcut.value,
        this.shortcutHandlers['color-picker:open']!
      );
    }
  }

  private openColorPicker(): void {
    const mainWindow = this.app.main.win;
    mainIpc.send(mainWindow.webContents, 'route', {
      path: '/tools/color-picker',
    });
    mainWindow.show();
  }
}
