import pkg from '../package.json';

export const PKG_JSON = pkg;

export const STORE_KEY_MAP = {
  mainBounds: 'settings/mainBounds',
  shortcuts: 'settings/shortcuts',
} as const;
