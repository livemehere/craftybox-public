export const SHORTCUT_META_MAP: Record<
  string,
  {
    label: string;
    description: string;
  }
> = {
  'shortcut:capture:cursor': {
    label: 'Screenshot',
    description: 'Take screenshot of monitor where cursor is.',
  },
} as const;

export function getShortcutMeta(key: string) {
  return (
    SHORTCUT_META_MAP[key] || {
      label: 'unknown',
      description: 'unknown',
    }
  );
}
