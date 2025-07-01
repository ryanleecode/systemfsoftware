/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  cacheDir: '../node_modules/.vite/node',

  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.nx'],
    reporters: ['default'],
    watch: false,
    coverage: {
      reportsDirectory: '../coverage/node',
      provider: 'v8',
      enabled: false,
      include: ['src/**/*'],
      exclude: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    },
    env: {
      TESTCONTAINERS_RYUK_DISABLED: 'true',
      TESTCONTAINERS_HUB_IMAGE_NAME_PREFIX: '',
      TESTCONTAINERS_CHECKS_DISABLE: 'true',
      DOCKER_HOST: 'unix:///var/run/docker.sock',
      TESTCONTAINERS_HOST_OVERRIDE: 'localhost',
      TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE: '/var/run/docker.sock',
    },
  },
})
