import { LogFunctions } from 'electron-log';
import log from 'electron-log/main';
import { App } from '@main/core/App';

export type TModuleShortcut = {
  key: `shortcut:${string}`;
  fallbackAccelerator: string;
  callback: () => void;
};

export interface IAppModule {
  name: string;
  initialize(): Promise<void>;
  registerIpcHandlers(): Promise<void>;
  getShortcuts(): TModuleShortcut[];
}

export type BaseModuleClass = {
  new (app: App): BaseModule;
};

export abstract class BaseModule implements IAppModule {
  readonly name: string;
  protected logger: LogFunctions;
  protected app: App;

  constructor(app: App, name: string) {
    this.logger = log.scope(name);
    this.app = app;
    this.name = name;
  }

  /** if you need to initialize something, override this method */
  async initialize() {
    return Promise.resolve();
  }

  /** if you need to register ipc handlers, override this method */
  async registerIpcHandlers() {
    return Promise.resolve();
  }

  /** if you need to register global shortcuts, override this method */
  getShortcuts(): TModuleShortcut[] {
    return [];
  }
}
