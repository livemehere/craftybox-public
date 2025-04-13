import { config } from '@main/config';
import { nativeImage } from 'electron';

import { resolve } from 'path';

export const constants = {
  TRAY_ICON_IMAGE: nativeImage
    .createFromPath(
      resolve(
        __dirname,
        `assets/icons/${config.IS_MAC ? 'iconTemplate.png' : 'icon.ico'}`
      )
    )
    .resize({ width: 24, height: 24 }),
  WINDOW_ICON_IMAGE: nativeImage
    .createFromPath(
      resolve(
        __dirname,
        `assets/icons/${config.IS_MAC ? 'icon.png' : 'icon.ico'}`
      )
    )
    .resize({ width: 64, height: 64 }),
};
