import { useState } from 'react';
import { uid } from 'uid';
import { AnimatePresence, motion } from 'motion/react';
import { createPortal } from 'react-dom';

import { cn } from '@/utils/cn';

import { PushOption, ToastContext, ToastMessage } from './ToastContext';

const SHADOW_MAP = {
  info: 'inset-shadow-blue-500/90',
  success: 'inset-shadow-green-500/90',
  error: 'inset-shadow-red-500/90',
  warning: 'inset-shadow-yellow-500/90',
};

export default function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const pushMessage = (message: string, options?: PushOption) => {
    const id = uid(10);
    const duration = options?.duration ?? 3000;
    const type = options?.type ?? 'info';
    setMessages((prev) => [
      ...prev,
      { id, message, duration, type, ...options },
    ]);
    setTimeout(() => {
      removeMessage(id);
    }, duration);
  };

  const clearAll = () => {
    setMessages([]);
  };

  const removeMessage = (id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  return (
    <ToastContext.Provider value={{ messages, pushMessage, clearAll }}>
      {children}
      {createPortal(
        <div className="fixed right-20 bottom-20 flex flex-col items-end space-y-4 p-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                layout
                className={cn(
                  'typo-body2 border-app-soft-gray relative cursor-pointer rounded border-b bg-white/5 px-28 py-16 inset-shadow-xs backdrop-blur-lg hover:bg-black/70',
                  {
                    [SHADOW_MAP[msg.type as keyof typeof SHADOW_MAP]]: msg.type,
                  }
                )}
                animate={{
                  opacity: [0, 1],
                  x: ['20%', '0%'],
                }}
                exit={{
                  opacity: [1, 0],
                  x: ['0%', '20%'],
                  transition: {
                    duration: 0.2,
                  },
                }}
                transition={{
                  type: 'spring',
                  duration: 0.15,
                  stiffness: 100,
                  damping: 20,
                }}
                onClick={() => {
                  msg.onClick?.();
                  removeMessage(msg.id);
                }}
              >
                {msg.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}
