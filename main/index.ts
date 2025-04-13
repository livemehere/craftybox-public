import { app } from 'electron';
import log from 'electron-log/main';
import { AppManager } from '@main/managers/AppManager';

log.initialize();
AppManager.create().catch((e) => {
  log.error(e);
  app.quit();
});
