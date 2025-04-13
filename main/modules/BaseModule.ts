import { LogFunctions } from 'electron-log';
import log from 'electron-log/main';
import { mainIpc } from '@electron-buddy/ipc/main';
import { App } from '@main/core/App';
import { InvokeMap } from '@shared/types/electron-buddy';
import { globalShortcut } from 'electron';
import { TShortcutKeys } from '@shared/types/shortcut-types';

export interface IModule {
  name: string;
  initialize(): Promise<void> | void;
  registerIpcHandlers(): Promise<void>;
  registerShortcuts(): Promise<void>;
  getShortcutHandlers(): Partial<Record<TShortcutKeys, () => void>>;
}

export abstract class BaseModule implements IModule {
  readonly name: string;
  protected logger: LogFunctions;
  protected app: App;
  protected shortcutHandlers: Partial<Record<TShortcutKeys, () => void>> = {};

  constructor(app: App, name: string) {
    this.logger = log.scope(name);
    this.app = app;
    this.name = name;
  }

  async initialize() {
    await this.registerIpcHandlers();
    await this.registerShortcuts();
  }
  abstract registerIpcHandlers(): Promise<void>;
  abstract registerShortcuts(): Promise<void>;

  getShortcutHandlers(): Partial<Record<TShortcutKeys, () => void>> {
    return this.shortcutHandlers;
  }

  protected registerIpcHandler<T extends keyof InvokeMap>(
    channel: T,
    handler: (data: InvokeMap[T]['payload']) => InvokeMap[T]['response']
  ): void {
    mainIpc.handle(channel, handler);
    this.logger.debug(`Registered IPC handler for ${String(channel)}`);
  }

  protected registerShortcut(accelerator: string, handler: () => void): void {
    try {
      globalShortcut.register(accelerator, handler);
      this.logger.debug(`Registered shortcut: ${accelerator}`);
    } catch (error) {
      this.logger.error(`Failed to register shortcut: ${accelerator}`, error);
    }
  }

  protected unregisterShortcut(accelerator: string): void {
    try {
      globalShortcut.unregister(accelerator);
      this.logger.debug(`Unregistered shortcut: ${accelerator}`);
    } catch (error) {
      this.logger.error(`Failed to unregister shortcut: ${accelerator}`, error);
    }
  }
}
