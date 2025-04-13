import { app } from 'electron';
import log from 'electron-log/main';
import { App } from '@main/core/App';

log.initialize();
log.info('Starting application...');

App.create().catch((e) => {
  log.error('Failed to create AppManager');
  log.error(e);
  app.quit();
});
