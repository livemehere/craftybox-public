import { createContext, useContext } from 'react';

export type PushOption = {
  duration?: number;
  type?: 'info' | 'success' | 'error' | 'warning';
  onClick?: () => void;
};

export type ToastMessage = {
  id: string;
  message: string;
} & PushOption;

export type ToastContextType = {
  messages: ToastMessage[];
  pushMessage: (message: string, options?: PushOption) => void;
  clearAll: () => void;
};

export const ToastContext = createContext({} as ToastContextType);

export const useToast = () => useContext(ToastContext);
