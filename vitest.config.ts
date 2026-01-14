import { defineConfig } from 'vitest/config'

export default defineConfig({

  test: {
    globals: true,     // so can use `describe`/`it` without importing them
    environment: 'node', 
    include: ['tests/**/*.test.{js,ts}'],
    setupFiles: ['./tests/setup.ts'],
  },

  define: {
    __VERSION__: JSON.stringify('test-version'),
  }
})