export const KBD_MAP: {
  [key: string]: string | { win32: string; darwin: string };
} = {
  Meta: '⌘',
  Control: {
    win32: 'Ctrl',
    darwin: '⌃',
  },
  Alt: {
    win32: 'Alt',
    darwin: '⌥',
  },
  Shift: '⇧',
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  Enter: '↵',
  Escape: 'Esc',
  Backspace: '⌫',
  Delete: '⌦',
  Tab: 'Tab',
  CapsLock: 'Caps',
  PageUp: 'PgUp',
  PageDown: 'PgDn',
  Insert: 'Ins',
  PrintScreen: 'PrtScn',
  ScrollLock: 'ScrLk',
};
