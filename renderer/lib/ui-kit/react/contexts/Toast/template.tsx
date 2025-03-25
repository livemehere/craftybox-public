import { ReactNode } from 'react';

import { IToast } from './index';

type ToastTemplateType = 'error' | 'success' | 'info';

const COLOR_MAP: Record<
  ToastTemplateType,
  {
    bg: string;
    text: string;
    icon: string;
  }
> = {
  error: {
    bg: '#FFEDED',
    text: '#EF5D5D',
    Icon: '⚠️'
  },
  success: {
    bg: '#DBFFF4',
    text: '#18D9A0',
    Icon: '👋'
  },
  info: {
    bg: '#E5F3FE',
    text: '#2592EC',
    Icon: '👉'
  }
};

export function createToastTemplate(type: ToastTemplateType, render: ReactNode): Omit<IToast, 'id'> {
  const { bg, text, icon } = COLOR_MAP[type];
  return {
    background: bg,
    render: (
      <span style={{ color: text, fontWeight: 700 }}>
        {icon} {<>{render}</>}
      </span>
    )
  };
}
