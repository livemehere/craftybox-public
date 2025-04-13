import { App } from '@main/core/App';
import { TPlatform } from '@shared/types/os-types';

import { AppModule } from './AppModule';

export class PlatformModule extends AppModule {
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
