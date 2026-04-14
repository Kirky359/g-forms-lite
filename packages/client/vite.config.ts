import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    // Coverage — scoped to hooks, utils, and components; excludes Firebase wiring and bootstrap
    coverage: {
      provider: 'v8',
      include: ['src/hooks/**', 'src/utils/**', 'src/components/**'],
      exclude: ['src/**/__tests__/**'],
      thresholds: {
        lines: 55,
        functions: 55,
      },
    },
  },
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('../shared/src', import.meta.url)),
      '@forms/shared': fileURLToPath(new URL('../shared/src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/graphql': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
