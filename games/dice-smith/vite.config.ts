import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  base: './',
  plugins: [preact()],
  build: { chunkSizeWarningLimit: 900 },
  test: { include: ['tests/**/*.test.ts'] },
} as any);
