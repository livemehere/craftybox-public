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

export type AppModuleClass = {
  new (app: App): AppModule;
};

export abstract class AppModule implements IAppModule {
  readonly name: string;
  protected logger: LogFunctions;
  protected app: App;

  constructor(app: App, name: string) {
    this.logger = log.scope(name);
    this.app = app;
    this.name = name;
  }

  async initialize() {
    return Promise.resolve();
  }
  async registerIpcHandlers() {
    return Promise.resolve();
  }
  getShortcuts(): TModuleShortcut[] {
    return [];
  }
}
