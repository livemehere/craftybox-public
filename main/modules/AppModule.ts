import { LogFunctions } from 'electron-log';
import log from 'electron-log/main';
import { mainIpc } from '@electron-buddy/ipc/main';
import { App } from '@main/core/App';
import { InvokeMap } from '@shared/types/electron-buddy';

export type TModuleShortcut = {
  key: `shortcut:${string}`;
  fallbackAccelerator: string;
  callback: () => void;
};

export abstract class AppModule {
  readonly name: string;
  protected logger: LogFunctions;
  protected app: App;

  constructor(app: App, name: string) {
    this.logger = log.scope(name);
    this.app = app;
    this.name = name;
  }

  initialize() {
    return Promise.resolve();
  }
  registerIpcHandlers() {
    return Promise.resolve();
  }
  getShortcuts(): TModuleShortcut[] {
    return [];
  }

  protected registerIpcHandler<T extends keyof InvokeMap>(
    channel: T,
    handler: (data: InvokeMap[T]['payload']) => InvokeMap[T]['response']
  ): void {
    mainIpc.handle(channel, handler);
    this.logger.debug(`Registered IPC handler for ${String(channel)}`);
  }
}
