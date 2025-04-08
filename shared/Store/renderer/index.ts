import { rendererIpc } from '@electron-buddy/ipc/renderer';
import { Emitter } from '@fewings/core/classes';

export type TStoreData<T> = {
  data: T;
  fetchTime: number;
};

type TStoreEvents = {
  [key: `${string}change`]: (data: TStoreData<any>) => void;
};

export default class Store extends Emitter<TStoreEvents> {
  private cache = new Map<string, TStoreData<any>>();

  getCache<T>(key: string) {
    return this.cache.get(key) as TStoreData<T> | undefined;
  }

  private setCache<T>(key: string, data: T) {
    const cache: TStoreData<T> = {
      data,
      fetchTime: Date.now(),
    };
    this.cache.set(key, cache);
  }

  /**
   * 1. return cache if exists
   * 2. if not, return defaultData and fetch data from main process and update later.(listen to `${key}change` event)
   */
  getData<T>(key: string, defaultData: T) {
    const cache = this.getCache<T>(key);
    if (cache) {
      // TODO: check cache expired
      return cache;
    }

    rendererIpc
      // @ts-expect-error
      .invoke('store:get', {
        key,
        defaultData,
      })
      .then((data: any) => {
        this.setCache(key, data);
        this.dispatch(`${key}change`, data);
      });

    return cache;
  }

  /**
   * 1. set data to file system
   * 2. update cache and dispatch `${key}change` event
   */
  async setData<T>(key: string, data: T) {
    // @ts-expect-error
    await rendererIpc.invoke('store:set', {
      key,
      data,
    });
    this.setCache<T>(key, data);
    const newData = this.getCache<T>(key);
    this.dispatch(`${key}change`, newData as TStoreData<T>);
    return newData;
  }
}
