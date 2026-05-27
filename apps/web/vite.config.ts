import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@spektra/shared-types': path.resolve(__dirname, '../../packages/shared-types/index.ts'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
