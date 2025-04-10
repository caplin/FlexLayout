// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,     // optional: so you can use `describe`/`it` without importing them
    environment: 'node', // since you're doing plain JS unit tests
    include: ['tests/**/*.test.{js,ts}'], // adjust if your tests live elsewhere
  },
})