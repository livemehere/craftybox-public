import { TPlatform } from '@shared/types/os-types';

import { KBD_MAP } from '@/constants/kbd';

export const resolveShortCutToKbd = (str: string, os: TPlatform) => {
  return str.split('+').map<string>((key) => {
    return (
      (typeof KBD_MAP[key] === 'object' ? KBD_MAP[key][os] : KBD_MAP[key]) ||
      key
    );
  });
};
