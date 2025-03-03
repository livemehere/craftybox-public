import { LogFunctions } from 'electron-log';
import log from 'electron-log/main';

export class Manager {
  logger: LogFunctions;

  constructor({ logScope }: { logScope: string }) {
    this.logger = log.scope(logScope);
  }
}
