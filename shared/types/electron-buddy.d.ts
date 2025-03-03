import type { ProgressInfo } from 'electron-builder';
import { TShortcutKeys } from '@shared/types/shortcut-types';
import { TPlatform } from '@shared/types/os-types';

export {};

declare module '@electron-buddy/ipc/main' {
  interface ElectronBuddyInvokeMap extends InvokeMap {}
  interface ElectronBuddyMessageMap extends MessageMap {}
}

declare module '@electron-buddy/ipc/renderer' {
  interface ElectronBuddyInvokeMap extends InvokeMap {}
  interface ElectronBuddyMessageMap extends MessageMap {}
}

/*
 * Define channel, payload, and response types
 *
 * channel: string
 * payload: any
 * response: any
 */
export type InvokeMap = {
  'window:ready': {
    payload: 'main';
    response: void;
  };
  'window:hide': {
    payload: 'snapshot' | 'main';
    response: void;
  };
  'window:destroy': {
    payload: {
      id: number;
    };
    response: void;
  };
  'window:minimize': {
    payload: null;
    response: void;
  };
  'window:maximize': {
    payload: null;
    response: void;
  };
  'platform:get': {
    payload: null;
    response: TPlatform;
  };
  'window:createPin': {
    payload: {
      x: number;
      y: number;
      width: number;
      height: number;
      base64: string;
    };
    response: void;
  };
  'window:showPin': {
    payload: {
      id: number;
    };
    response: void;
  };
  'window:showMain': {
    payload: null;
    response: void;
  };
  'shortcut:set': {
    payload: {
      key: TShortcutKeys;
      register: boolean;
    };
    response: void;
  };
};

type MessageMap = {
  'snapshot:get': {
    response: {
      base64: string;
      x: number;
      y: number;
      width: number;
      height: number;
      scaleFactor: number;
    }; // base64
  };
  'snapshot:reset': {
    response: void;
  };
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
      status: 'checking' | 'enable' | 'disable' | 'downloading' | 'done' | 'error';
      progressInfo?: ProgressInfo;
    };
  };
};
