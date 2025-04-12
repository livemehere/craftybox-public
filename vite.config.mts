/// <reference types="vitest" />

import { defineConfig } from 'vite';
import { electron } from '@electron-buddy/vite-plugin';
import svgr from 'vite-plugin-svgr';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fewingsSvgrVitePlugin } from '@fewings/svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

import path from 'path';

import { preloadScripts } from './preloadScripts';

const isStorybookEnv = process.env['npm_lifecycle_event'] === 'storybook';

export default defineConfig({
  root: './renderer',
  test: {
    include: ['./**/*.test.ts?(x)', '../main/**/*.test.ts'],
    setupFiles: './vitest.setup.ts',
    environment: 'jsdom',
  },
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
            injectToHead: preloadScripts,
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
