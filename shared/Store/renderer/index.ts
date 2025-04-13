import { rendererIpc } from '@electron-buddy/ipc/renderer';
import { Emitter } from '@fewings/core/classes';

import { createStoreData, StoreDataType } from '../schema';

export type FetchedStoreData<T> = StoreDataType<T> & {
  fetchTime: number;
};

type TStoreEvents = {
  [key: `${string}change`]: (data: FetchedStoreData<any>) => void;
};

export default class Store extends Emitter<TStoreEvents> {
  private cache = new Map<string, FetchedStoreData<any>>();

  getCache<T>(key: string) {
    return this.cache.get(key) as FetchedStoreData<T> | undefined;
  }

  private setCache<T>(key: string, data: StoreDataType<T>) {
    const cache: FetchedStoreData<T> = {
      ...data,
      fetchTime: Date.now(),
    };
    this.cache.set(key, cache);
    return cache;
  }

  /**
   * 1. return cache if exists
   * 2. if not, return defaultData and fetch data from main process and update later.(listen to `${key}change` event)
   */
  getData<T>(key: string, defaultData: T, version?: string) {
    const cache = this.getCache<T>(key);
    if (cache) {
      // TODO: check cache expired
      return cache;
    }

    rendererIpc
      .invoke('store:get', {
        key,
        defaultData,
        version,
      })
      .then((data) => {
        const cached = this.setCache(key, data);
        this.dispatch(`${key}change`, cached);
      });

    return cache;
  }

  /**
   * 1. set data to file system
   * 2. update cache and dispatch `${key}change` event
   */
  async setData<T>(key: string, data: T, version?: string) {
    await rendererIpc.invoke('store:set', {
      key,
      data,
      version,
    });
    const cached = this.setCache<T>(key, createStoreData(data, version));
    this.dispatch(`${key}change`, cached);
    return cached;
  }
}
