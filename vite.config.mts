import { defineConfig } from 'vite';
import { electron } from '@electron-buddy/vite-plugin';
import svgr from 'vite-plugin-svgr';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fewingsSvgrVitePlugin } from '@fewings/svgr';
import { injectStyleTag } from './injectStyleTags';

export default defineConfig({
  root: './renderer',
  plugins: [
    electron({
      copyDirs: ['assets'],
      main: {
        alias: {
          '@shared': path.resolve(__dirname, 'shared'),
          '@main': path.resolve(__dirname, 'main')
        }
      },
      injectToHead: injectStyleTag
    }),
    tailwindcss(),
    react(),
    svgr(),
    fewingsSvgrVitePlugin({
      svgPath: './renderer/assets/svg',
      outDir: './renderer/components/icons',
      svgImportBase: '@/assets/svg',
      componentName: 'Icon'
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'renderer'),
      '@shared': path.resolve(__dirname, 'shared'),
      '@main': path.resolve(__dirname, 'main')
    }
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
});
