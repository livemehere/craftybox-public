import { STORE_VERSION } from '@shared/constants';
import { isEmpty } from '@shared/utils/validation';

export type StoreInvokeMap = {
  'store:get': {
    payload: {
      version?: string;
      key: string;
      defaultData: any;
    };
    response: StoreDataType;
  };
  'store:set': {
    payload: {
      version?: string;
      key: string;
      data: any;
    };
    response: StoreDataType;
  };
};

export type StoreDataType<T = any> = {
  version: string;
  data: T;
};

export function validateStoreData(
  data: any,
  version?: string
): data is StoreDataType {
  const isValidType =
    typeof data === 'object' && data !== null && 'version' in data;
  if (isEmpty(data)) return false;
  if (!isValidType) return false;
  return version ? data.version === version : true;
}

export function createStoreData<T>(data: T, version = STORE_VERSION) {
  return {
    version,
    data,
  };
}
