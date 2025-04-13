import { App } from '@main/core/App';
import { TPlatform } from '@shared/types/os-types';

import { BaseModule } from './BaseModule';

export class PlatformModule extends BaseModule {
  constructor(app: App) {
    super(app, 'PlatformModule');
  }

  async registerShortcuts() {
    // 플랫폼 모듈은 현재 사용하는 단축키가 없음
  }

  async registerIpcHandlers() {
    this.registerIpcHandler('platform:get', () => {
      return process.platform as TPlatform;
    });
  }
}
