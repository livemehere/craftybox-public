import { App } from '@main/core/App';
import { mainIpc } from '@electron-buddy/ipc/main';
import { Shortcuts } from '@shared/types/shortcut-types';
import { STORE_KEY_MAP } from '@shared/constants';
import { getStoreData } from '@shared/Store/main';

import { BaseModule } from './BaseModule';

export class ColorPickerModule extends BaseModule {
  constructor(appManager: App) {
    super(appManager, 'ColorPickerModule');
    this.shortcutHandlers = {
      'color-picker:open': this.openColorPicker.bind(this),
    };
  }

  initialize(): void {
    this.registerIpcHandlers();
    this.registerShortcuts();
  }

  registerIpcHandlers(): void {
    // 컬러 피커 관련 IPC 핸들러가 필요한 경우 여기에 추가
  }

  registerShortcuts(): void {
    const shortcuts = getStoreData<Shortcuts>(STORE_KEY_MAP.shortcuts, []);

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
    const mainWindow = this.appManager.windowManager.mainWindow;
    mainIpc.send(mainWindow.webContents, 'route', {
      path: '/tools/color-picker',
    });
    mainWindow.show();
  }
}
