import {
  BaseModule,
  BaseModuleClass,
  TModuleShortcut,
} from '@main/modules/BaseModule';
import { TUserShortcutSettings } from '@shared/types/shortcut-types';
import { globalShortcut } from 'electron';
import log from 'electron-log/main';
import { STORE_KEY_MAP } from '@shared/constants';
import { getStoreData } from '@shared/Store/main';

import { App } from './App';

const logger = log.scope('ModuleManager');

export class ModuleManager {
  readyModules: BaseModuleClass[] = [];
  instances: BaseModule[] = [];
  constructor(initialModules: BaseModuleClass[]) {
    this.readyModules = initialModules;
  }

  async initialize(app: App) {
    const userSettings = getStoreData<TUserShortcutSettings>(
      STORE_KEY_MAP.shortcuts,
      []
    );
    const promises = [];

    this.instances = this.readyModules.map((Module) => new Module(app));
    logger.log(`${this.instances.length} modules detected.`);
    for (const Module of this.instances) {
      const promise = async () => {
        await Module.initialize();
        await Module.registerIpcHandlers();
        this.registerModuleShortcuts(Module.getShortcuts(), userSettings);
        logger.log(`${Module.name} initialized.`);
      };
      promises.push(promise());
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
          `${shortcut.key}(${accelerator}) : ${disabled ? 'disabled' : 'enabled'}`
        );
      } catch (error) {
        logger.log(`Failed to change ${shortcut.key}: ${accelerator}`, error);
      }
    }
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
