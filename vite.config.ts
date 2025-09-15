import { defineConfig, UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import pkg from './package.json';

export default defineConfig({
  root: './demo/',
  base: './', // use relative paths
  plugins: [react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        entryFileNames: 'demo.js',
        assetFileNames: (chunkInfo) => {
          return 'demo[extname]';
        },
      },
    },
  },
  server: {
    open: true,
  },
  define: {
    __VERSION__: JSON.stringify(pkg.version),
  },
} as UserConfig);
