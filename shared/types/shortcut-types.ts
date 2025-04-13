import type { TModuleShortcut } from '@main/modules/BaseModule';

export type TUserShortcutSettings = {
  key: TModuleShortcut['key'];
  value: string;
  enabled: boolean;
}[];
