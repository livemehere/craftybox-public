export type TShortcutKeys = 'capture:cursor' | 'color-picker:open';
export type Shortcuts = {
  key: TShortcutKeys;
  value: string;
  label: string;
  enabled: boolean;
  description: string;
}[];
