import type { ProgressInfo } from 'electron-builder';
import { BundleModuleInvokeMap, BundleModuleMessageMap } from '@main/modules';
import type { StoreInvokeMap } from '@shared/Store/schema';
export {};

declare module '@electron-buddy/ipc/main' {
  type ElectronBuddyInvokeMap = InvokeMap;
  type ElectronBuddyMessageMap = MessageMap;
}

declare module '@electron-buddy/ipc/renderer' {
  type ElectronBuddyInvokeMap = InvokeMap;
  type ElectronBuddyMessageMap = MessageMap;
}

/*
 * Define channel, payload, and response types
 *
 * channel: string
 * payload: any
 * response: any
 */
export type InvokeMap = StoreInvokeMap & BundleModuleInvokeMap;

type MessageMap = {
  'window:getId': {
    response: number;
  };
  route: {
    response: {
      path: string;
    };
  };
  update: {
    response: {
      status:
        | 'checking'
        | 'enable'
        | 'disable'
        | 'downloading'
        | 'done'
        | 'error';
      progressInfo?: ProgressInfo;
    };
  };
} & BundleModuleMessageMap;
