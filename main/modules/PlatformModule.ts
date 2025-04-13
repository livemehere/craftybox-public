import { App } from '@main/core/App';
import { TPlatform } from '@shared/types/os-types';

import { BaseModule } from './BaseModule';

export class PlatformModule extends BaseModule {
  constructor(appManager: App) {
    super(appManager, 'PlatformModule');
  }

  initialize(): void {
    this.registerIpcHandlers();
    this.registerShortcuts();
  }

  registerShortcuts(): void {
    // 플랫폼 모듈은 현재 사용하는 단축키가 없음
  }

  registerIpcHandlers(): void {
    this.registerIpcHandler('platform:get', () => {
      return process.platform as TPlatform;
    });
  }
}
