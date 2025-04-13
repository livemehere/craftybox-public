import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react';

import Store from '../renderer';

const STORE_KEY = 'electron-buddy-store';
const getGlobalStore = () => {
  // @ts-ignore
  if (!window[STORE_KEY]) {
    // @ts-ignore
    window[STORE_KEY] = new Store();
  }
  // @ts-ignore
  return window[STORE_KEY] as Store;
};

type Dispatch<T> = T | ((prev: T) => T);
const useStore = <T = unknown>(
  key: string,
  defaultData: T,
  version?: string
) => {
  const storeRef = useRef<Store>(undefined);
  if (!storeRef.current) {
    storeRef.current = getGlobalStore();
  }
  const store = storeRef.current;
  const storeData = useSyncExternalStore(
    (cb) => store.on(`${key}change`, cb),
    () => store.getData<T>(key, defaultData, version)
  );

  const setStoreData = useCallback(
    (data: Dispatch<T>) => {
      store.setData(
        key,
        typeof data === 'function'
          ? (data as (prev: T) => T)(store.getCache<T>(key)!.data)
          : data,
        version
      );
    },
    [key, store, version]
  );

  return useMemo(
    () => ({
      data: storeData?.data,
      loading: storeData === undefined,
      setData: setStoreData,
    }),
    [storeData, setStoreData]
  );
};

export default useStore;
