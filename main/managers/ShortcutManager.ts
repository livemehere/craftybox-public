import { globalShortcut } from 'electron';
import { mainIpc } from '@electron-buddy/ipc/main';
import { Shortcuts, TShortcutKeys } from '@shared/types/shortcut-types';
import registerStoreIpcHandlers, { getStoreData, setStoreData } from '@shared/Store/main';
import { AppManager } from '@main/managers/AppManager';
import { Manager } from '@main/managers/Manager';
import { STORE_KEY_MAP } from '@shared/constants';

export class ShortcutManager extends Manager {
  private readonly app: AppManager;
  private readonly shortcutHandlers: Record<TShortcutKeys, () => void>;
  private readonly defaultShortcuts: Shortcuts = [
    {
      key: 'capture:cursor',
      value: 'Control+1',
      label: '캡쳐하기',
      enabled: true,
      description: '현재 마우스 커서가 위치한 모니터를 캡쳐합니다.'
    },
  ];

  constructor({ app }: { app: AppManager }) {
    super({ logScope: 'ShortcutManager' });
    this.app = app;

    this.shortcutHandlers = {
      'capture:cursor': () => this.app.snapshotModule.handleCaptureWithRenderer(this.app.windowManager.snapshotWindow),
      'color-picker:open': this.openColorPicker.bind(this)
    };

    this.initialize();
    this.registerIpcHandlers();

    registerStoreIpcHandlers({
      onSet: (key, data) => {
        if (key.includes('shortcuts')) {
          this.registerGlobalShortcuts(data as Shortcuts);
        }
      }
    });
  }

  private openColorPicker(): void {
    const mainWindow = this.app.windowManager.mainWindow;
    mainIpc.send(mainWindow.webContents, 'route', { path: '/tools/color-picker' });
    mainWindow.show();
  }

  private registerGlobalShortcuts(shortcuts: Shortcuts): void {
    globalShortcut.unregisterAll();

    shortcuts.forEach((shortcut) => {
      if (!shortcut.enabled) return;

      try {
        const handler = this.shortcutHandlers[shortcut.key];
        if (handler) {
          globalShortcut.register(shortcut.value, handler);
        }
      } catch (error) {
        this.logger.error(`단축키 등록 실패: ${shortcut.value}`, error);
      }
    });
  }

  private registerIpcHandlers(): void {
    mainIpc.handle('shortcut:set', async ({ key, register }) => this.toggleShortcut(key, register));
  }

  private async toggleShortcut(key: TShortcutKeys, enabled: boolean): Promise<void> {
    const shortcuts = getStoreData<Shortcuts>(STORE_KEY_MAP.shortcuts, this.defaultShortcuts);

    // shortcuts가 배열이 아닌 경우 기본값 사용
    if (!Array.isArray(shortcuts)) {
      this.logger.warn('shortcuts가 배열이 아닙니다. 기본값을 사용합니다.');
      return;
    }

    const targetShortcut = shortcuts.find((shortcut) => shortcut.key === key);

    if (!targetShortcut) return;

    try {
      if (enabled && targetShortcut.enabled) {
        const handler = this.shortcutHandlers[key];
        if (handler) {
          globalShortcut.register(targetShortcut.value, handler);
        }
      } else {
        globalShortcut.unregister(targetShortcut.value);
      }
    } catch (error) {
      this.logger.error(`단축키 토글 실패: ${key}`, error);
    }
  }

  private initialize(): void {
    try {
      const storedShortcuts = getStoreData<Shortcuts>(STORE_KEY_MAP.shortcuts, this.defaultShortcuts);
      const mergedShortcuts = this.mergeWithDefaults(storedShortcuts);

      setStoreData(STORE_KEY_MAP.shortcuts, mergedShortcuts);
      this.registerGlobalShortcuts(mergedShortcuts);
    } catch (error) {
      this.logger.error('단축키 초기화 중 오류 발생:', error);
      // 오류 발생 시 기본값으로 초기화
      setStoreData(STORE_KEY_MAP.shortcuts, this.defaultShortcuts);
      this.registerGlobalShortcuts(this.defaultShortcuts);
    }
  }

  private mergeWithDefaults(storedShortcuts: Shortcuts): Shortcuts {
    if (!Array.isArray(storedShortcuts)) {
      this.logger.warn('storedShortcuts가 배열이 아닙니다. 기본값을 사용합니다.');
      return this.defaultShortcuts;
    }

    return this.defaultShortcuts.map((defaultShortcut) => {
      const userShortcut = storedShortcuts.find((shortcut) => shortcut.key === defaultShortcut.key);

      if (!userShortcut) {
        return defaultShortcut;
      }

      return {
        ...defaultShortcut,
        ...userShortcut
      };
    });
  }
}
