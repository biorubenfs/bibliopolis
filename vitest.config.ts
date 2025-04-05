import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [],
    include: ['src/tests/**/*.test.ts'],
    watch: false,
    isolate: true
  }
})
