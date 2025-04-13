import pkg from '../package.json';

export const PKG_JSON = pkg;

export const STORE_KEY_MAP = {
  mainBounds: 'settings/mainBounds',
  shortcuts: 'settings/shortcuts',
} as const;

export const STORE_VERSION = '1.0.0';
