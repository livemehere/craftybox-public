import { ReactNode } from 'react';
import { useContextSelector } from '@fewings/react/contextSelector';

import { OverlayContext } from './OverlayContext';
import { OverlayOptions, OverlayBaseProps, OverlayItem } from './schema';

export const useOverlay = () => {
  const setItems = useContextSelector(OverlayContext, (v) => v.setItems);
  const idRef = useContextSelector(OverlayContext, (v) => v.idRef);

  const close = (id: number) => {
    setItems((prev) => prev.filter((overlay) => overlay.id !== id));
  };

  const closeAll = () => {
    setItems([]);
  };

  const open = <Resolve>(
    render: (props: OverlayBaseProps<Resolve>) => ReactNode,
    options?: OverlayOptions
  ) => {
    return new Promise<Resolve>((resolve, reject) => {
      const overlayId = idRef.current++;
      const overlay: OverlayItem<Resolve> = {
        id: overlayId,
        render,
        options,
        resolve: (value) => {
          close(overlayId);
          resolve(value);
        },
        reject: (reason) => {
          close(overlayId);
          reject(reason);
        },
      };
      setItems((prev) => [...prev, overlay]);
    });
  };

  return {
    open,
    closeAll,
  };
};
