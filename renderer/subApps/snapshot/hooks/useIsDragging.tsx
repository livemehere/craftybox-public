import { useState } from 'react';
import { useRefEffect } from '@toss/react';

export const useIsDragging = () => {
  const [isDragging, setIsDragging] = useState(false);

  const ref = useRefEffect((element: HTMLElement | null) => {
    if (!element) return;

    const isDragStart = () => {
      setIsDragging(true);
    };

    element.addEventListener('pointerdown', isDragStart);

    const isDragEnd = () => {
      setIsDragging(false);
    };

    element.addEventListener('pointerup', isDragEnd);

    return () => {
      element.removeEventListener('pointerdown', isDragStart);
      element.removeEventListener('pointerup', isDragEnd);
    };
  }, []);

  return [isDragging, ref] as const;
};
