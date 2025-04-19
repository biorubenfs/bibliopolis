import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    globalSetup: 'src/tests/setup/global-setup.ts',
    setupFiles: ['src/tests/setup/setup-tests.ts'],
    include: ['src/tests/**/*.test.ts'],
    watch: false,
    isolate: true,
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    hookTimeout: 20_000
  }
})
