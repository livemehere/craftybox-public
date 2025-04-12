import { mainIpc } from '@electron-buddy/ipc/main';
import { app } from 'electron';

import { resolve } from 'path';
import fs from 'fs';

function ensureStoreFilePath(key: string) {
  const dir = resolve(app.getPath('userData'), 'stores');
  const hasDepth = key.includes('/');
  const depths = key.split('/');
  const dirs = hasDepth ? depths.slice(0, -1) : [];
  const filename = `${hasDepth ? depths[depths.length - 1] : key}.json`;
  const dirPath = resolve(dir, ...dirs);
  const filePath = resolve(dirPath, filename);

  const dirExist = fs.existsSync(dirPath);
  if (!dirExist) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return filePath;
}

/**
 * call at main process for getting store data
 */
export function getStoreData<T>(key: string, defaultData: T) {
  const filePath = ensureStoreFilePath(key);
  const fileExist = fs.existsSync(filePath);
  if (!fileExist) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData));
  }
  return JSON.parse(fs.readFileSync(filePath, { encoding: 'utf-8' })) as T;
}

/**
 * call at main process for setting store data
 */
export function setStoreData(key: string, data: any) {
  const filePath = ensureStoreFilePath(key);
  fs.writeFileSync(filePath, JSON.stringify(data));
}

/**
 * call this function to register store ipc handlers at main process
 */
export default function registerStoreIpcHandlers({
  onGet,
  onSet,
}: {
  onGet?: (key: string, defaultData: any) => any;
  onSet?: (key: string, data: any) => void;
} = {}) {
  mainIpc.handle(
    'store:get',
    async ({ key, defaultData }: { key: string; defaultData: any }) => {
      const data = getStoreData(key, defaultData);
      onGet?.(key, data);
      return data;
    }
  );

  mainIpc.handle(
    'store:set',
    async ({ key, data }: { key: string; data: any }) => {
      onSet?.(key, data);
      return setStoreData(key, data);
    }
  );
}
