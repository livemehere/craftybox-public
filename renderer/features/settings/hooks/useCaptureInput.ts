import { useEffect, useRef, useState } from 'react';

const resolveNumber = (key: string, shift: boolean) => {
  const specialChars = '!@#$%^&*()';
  const numbers = '1234567890';
  const index = specialChars.indexOf(key);
  return shift && index !== -1 ? numbers[index] : key;
};

export default function useCaptureInput({
  active,
  onEnd,
}: { active?: boolean; onEnd?: (inputs: string) => void } = {}) {
  const result = useRef('');
  const [curChar, setCurChar] = useState('');
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCurChar(e.key);
        return;
      }

      const supportKeys = [
        e.ctrlKey && 'Control',
        e.shiftKey && 'Shift',
        e.altKey && 'Alt',
        e.metaKey && 'Meta',
      ]
        .filter(Boolean)
        .join('+');

      const isSupportKey = ['Shift', 'Control', 'Alt', 'Meta'].includes(e.key);
      const key = resolveNumber(e.key, e.shiftKey);
      setCurChar(key);

      if (result.current.includes(key) || isSupportKey) return;
      result.current = [supportKeys, key].join('+');

      if (!isSupportKey) {
        onEnd?.(result.current);
        result.current = '';
      }
    };
    window.addEventListener('keydown', handler);

    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [active, onEnd]);

  const reset = () => {
    result.current = '';
    setCurChar('');
  };

  return {
    curChar,
    reset,
  };
}
