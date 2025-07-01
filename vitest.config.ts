/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Use projects for monorepo setup
    projects: ['packages/*/vite.config.ts'],
    globals: true,
    environment: 'node',
    watch: false,
    // Workspace-level reporters
    reporters: ['default'],
    // Coverage configuration for the entire workspace
    coverage: {
      provider: 'v8',
      enabled: false,
      reportsDirectory: 'coverage',
    },
  },
})
