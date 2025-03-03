import { app } from 'electron';
import log from 'electron-log/main';
import { AppManager } from '@main/managers/AppManager';

log.initialize();
new AppManager().initialize().catch((e) => {
  log.error(e);
  app.quit();
});
