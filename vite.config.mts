/// <reference types="vitest" />

import { defineConfig } from 'vite';
import { electron } from '@electron-buddy/vite-plugin';
import svgr from 'vite-plugin-svgr';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fewingsSvgrVitePlugin } from '@fewings/svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

import path from 'path';

import { fontStyles } from './scripts/fontStyles';

const isStorybookEnv = !!process.env['npm_lifecycle_event'];

export default defineConfig({
  test: {
    include: ['../__test__/**/*.test.ts?(x)'],
    setupFiles: './__test__/vitest.setup.ts',
    environment: 'jsdom',
  },
  root: './renderer',
  plugins: [
    ...(isStorybookEnv
      ? []
      : [
          electron({
            copyDirs: ['assets'],
            main: {
              alias: {
                '@shared': path.resolve(__dirname, 'shared'),
                '@main': path.resolve(__dirname, 'main'),
              },
            },
            injectToHead: fontStyles,
          }),
        ]),
    tailwindcss(),
    react(),
    svgr(),
    fewingsSvgrVitePlugin({
      svgPath: './renderer/assets/svg',
      outDir: './renderer/components/icons',
      svgImportBase: '@/assets/svg',
      componentName: 'Icon',
    }),
    tsconfigPaths(),
  ],
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
});
