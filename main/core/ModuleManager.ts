import {
  BaseModule,
  BaseModuleClass,
  TModuleShortcut,
} from '@main/modules/BaseModule';
import { TUserShortcutSettings } from '@shared/types/shortcut-types';
import { globalShortcut } from 'electron';
import log from 'electron-log/main';
import { STORE_KEY_MAP } from '@shared/constants';
import { getStoreData, setStoreData } from '@shared/Store/main';

import { App } from './App';

const logger = log.scope('ModuleManager');

export class ModuleManager {
  readyModules: BaseModuleClass[] = [];
  instances: BaseModule[] = [];
  shortcuts: TUserShortcutSettings = [];
  constructor(initialModules: BaseModuleClass[]) {
    this.readyModules = initialModules;
  }

  async initialize(app: App) {
    const { data: userSettings } = getStoreData<TUserShortcutSettings>(
      STORE_KEY_MAP.shortcuts,
      []
    );
    logger.log('prev userSettings', userSettings);
    const promises = [];

    this.instances = this.readyModules.map((Module) => new Module(app));
    logger.log(`${this.instances.length} modules detected.`);
    for (const Module of this.instances) {
      const promise = async () => {
        await Module.initialize();
        await Module.registerIpcHandlers();
        const registerShortcuts = this.registerModuleShortcuts(
          Module.getShortcuts(),
          userSettings
        );
        this.shortcuts.push(...registerShortcuts);
        logger.log(`${Module.name} initialized.`);
      };
      promises.push(promise());
    }
    await Promise.all(promises);
    logger.log('final userSettings', this.shortcuts);
    setStoreData(STORE_KEY_MAP.shortcuts, this.shortcuts);
  }

  private registerModuleShortcuts(
    shortcuts: TModuleShortcut[],
    userSettings: TUserShortcutSettings
  ): TUserShortcutSettings {
    const finalShortcuts: TUserShortcutSettings = [];
    for (const shortcut of shortcuts) {
      const userSetting = userSettings.find((u) => u.key === shortcut.key);
      const accelerator = userSetting?.value ?? shortcut.fallbackAccelerator;
      const disabled = userSetting && !userSetting.enabled;
      if (disabled) continue;
      try {
        globalShortcut.register(accelerator, shortcut.callback);
        logger.log(
          `Added ${shortcut.key}(${accelerator}) : ${disabled ? 'disabled' : 'enabled'}`
        );
        finalShortcuts.push({
          key: shortcut.key,
          value: accelerator,
          enabled: !disabled,
        });
      } catch (error) {
        logger.log(`Failed to change ${shortcut.key}: ${accelerator}`, error);
      }
    }
    return finalShortcuts;
  }

  reRegisterShortcuts(userSettings: TUserShortcutSettings) {
    globalShortcut.unregisterAll();
    logger.log('Unregister all module shortcuts.');
    for (const Module of this.instances) {
      this.registerModuleShortcuts(Module.getShortcuts(), userSettings);
    }
    logger.log('Re-register module shortcuts.');
  }
}
