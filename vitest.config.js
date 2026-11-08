import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Test-only configuration. Production builds continue to use vite.config.js.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    css: false,
    restoreMocks: true,
    clearMocks: true,
  },
})
