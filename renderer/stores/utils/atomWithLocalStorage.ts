import { atom } from 'jotai';
import { SetStateAction } from 'react';

export const atomWithLocalStorage = <T>(key: string, initialValue: T) => {
  const _v = localStorage.getItem(key);
  const parsedV = _v ? (JSON.parse(_v) as T) : initialValue;
  const baseAtom = atom<T>(_v ? parsedV : initialValue);

  return atom(
    (get) => get(baseAtom),
    (get, set, value: SetStateAction<T>) => {
      set(baseAtom, value);
      localStorage.setItem(key, JSON.stringify(get(baseAtom)));
    }
  );
};
