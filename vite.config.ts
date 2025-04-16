import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  root: './demo/',
  base: './', // this tells Vite to use relative paths
  plugins: [react()],
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
  resolve: {
    alias: {
      // Optional: for TypeScript path mappings
      // '@': path.resolve(__dirname, './src'),
    },
  },
});
