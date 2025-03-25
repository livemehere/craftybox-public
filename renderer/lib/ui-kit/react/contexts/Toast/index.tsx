import {
  createContext,
  ReactNode,
  RefObject,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, HTMLMotionProps, motion } from 'motion/react';

export interface IToast {
  id: number;
  background: string;
  render: ReactNode;
  duration?: number; // s
  onClick?: (e: React.MouseEvent) => void;
}

interface IToastContext {
  push: (toast: Omit<IToast, 'id'>) => IToast;
  remove: (toast: IToast) => void;
}

export const ToastContext = createContext<IToastContext>({} as IToastContext);
export const useToast = () => useContext(ToastContext);

let seq = 0;
export const ToastProvider = ({
  children,
  toast: { height = 40, duration = 2, exitDuration = 0.3 } = {}
}: {
  children: ReactNode;
  toast?: {
    height?: number;
    duration?: number;
    exitDuration?: number;
  };
}) => {
  const controlRef = useRef<IToastContext>({} as IToastContext);

  return (
    <ToastContext
      value={{
        push: (...args) => controlRef.current.push(...args),
        remove: (...args) => controlRef.current.remove(...args)
      }}
    >
      <Toaster height={height} controls={controlRef} duration={duration} exitDuration={exitDuration} />
      {children}
    </ToastContext>
  );
};

const Toaster = ({
  height,
  controls,
  duration,
  exitDuration
}: {
  height: number;
  controls: RefObject<IToastContext>;
  duration: number;
  exitDuration: number;
}) => {
  const restoreTimerRef = useRef<number>(undefined);
  const timerRef = useRef<number[]>([]);

  const [toasts, setToasts] = useState<IToast[]>([]);
  const [maxLen, setMaxLen] = useState(toasts.length);

  const push = (toast: Omit<IToast, 'id'>) => {
    const _toast: IToast = { ...toast, id: seq++ };
    clearTimeout(restoreTimerRef.current);
    const id = window.setTimeout(
      () => {
        remove(_toast);
      },
      (toast.duration ?? duration) * 1000
    );
    timerRef.current.push(id);
    setToasts((prev) => [_toast, ...prev]);
    return _toast;
  };
  const remove = (toast: IToast) => setToasts((prev) => prev.filter((t) => t !== toast));

  useEffect(() => {
    const curLen = toasts.length;
    if (curLen <= 0) {
      restoreTimerRef.current = window.setTimeout(() => {
        setMaxLen(0);
      }, exitDuration * 1000);
    } else {
      setMaxLen((prev) => Math.max(prev, curLen));
    }
  }, [toasts, exitDuration]);

  useImperativeHandle(controls, () => ({
    push,
    remove
  }));

  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      timerRef.current.forEach((t) => {
        clearTimeout(t);
      });
      clearTimeout(restoreTimerRef.current);
    };
  }, []);

  return createPortal(
    <ul
      style={{
        position: 'fixed',
        right: 0,
        left: 0,
        bottom: '100%',
        zIndex: 20,
        transition: 'translate 0.3s ease-out',
        translate: `0 ${maxLen * height}px`,
        height: `${maxLen * height}px`,
        pointerEvents: 'none'
      }}
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <Toast
            key={t.id}
            height={height}
            background={t.background}
            exitDuration={exitDuration}
            onClick={(e) => {
              if (t.onClick) {
                t.onClick(e);
              } else {
                remove(t);
              }
            }}
          >
            {t.render}
          </Toast>
        ))}
      </AnimatePresence>
    </ul>,
    document.body
  );
};

const Toast = ({
  children,
  background,
  height,
  exitDuration,
  ...props
}: {
  children: ReactNode;
  background: string;
  height: number;
  exitDuration: number;
} & Omit<HTMLMotionProps<'li'>, 'ref'>) => {
  return (
    <motion.li
      style={{
        background,
        height,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'all',
        position: 'relative'
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: exitDuration
        }
      }}
      {...props}
    >
      {children}
    </motion.li>
  );
};
