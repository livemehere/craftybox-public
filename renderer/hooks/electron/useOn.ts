import {
  rendererIpc,
  ElectronBuddyMessageMap,
} from '@electron-buddy/ipc/renderer';
import { useEffect, useRef } from 'react';

export default function useOn<C extends keyof ElectronBuddyMessageMap>(
  channel: C,
  listener: (response: ElectronBuddyMessageMap[C]['response']) => void,
  deps: any[] = []
) {
  const listenerRef = useRef(listener);

  useEffect(() => {
    listenerRef.current = listener;
  }, [listener]);

  useEffect(() => {
    const off = rendererIpc.on(channel, listenerRef.current);
    return () => {
      off();
    };
  }, [channel, ...deps]);
}
