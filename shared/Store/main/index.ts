import { mainIpc } from '@electron-buddy/ipc/main';
import { app } from 'electron';

import { resolve } from 'path';
import fs from 'fs';

import { createStoreData, StoreDataType, validateStoreData } from '../schema';

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
 * - read file and check it is valid store data
 * - if not, write default data to file
 * - return store data's data property
 */
export function getStoreData<T>(key: string, defaultData: T, version?: string) {
  const filePath = ensureStoreFilePath(key);
  const fileExist = fs.existsSync(filePath);
  if (!fileExist) {
    fs.writeFileSync(
      filePath,
      JSON.stringify(createStoreData(defaultData, version))
    );
  }
  const readData = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf-8' }));
  if (!validateStoreData(readData, version)) {
    fs.writeFileSync(
      filePath,
      JSON.stringify(createStoreData(defaultData, version))
    );
  }
  const validReadData = JSON.parse(
    fs.readFileSync(filePath, { encoding: 'utf-8' })
  );
  return validReadData as StoreDataType<T>;
}

/**
 * call at main process for setting store data
 */
export function setStoreData(key: string, data: any, version?: string) {
  const filePath = ensureStoreFilePath(key);
  const writeData = createStoreData(data, version);
  fs.writeFileSync(filePath, JSON.stringify(writeData));
  return writeData;
}

/**
 * call this function to register store ipc handlers at main process
 */
export default function registerStoreIpcHandlers({
  onGet,
  onSet,
}: {
  onGet?: (key: string, readData: StoreDataType) => any;
  onSet?: (key: string, writeData: StoreDataType) => void;
} = {}) {
  mainIpc.handle('store:get', async ({ key, defaultData, version }) => {
    const readData = getStoreData(key, defaultData, version);
    onGet?.(key, readData);
    return readData;
  });

  mainIpc.handle('store:set', async ({ key, data, version }) => {
    const writeData = setStoreData(key, data, version);
    onSet?.(key, writeData);
    return writeData;
  });
}
