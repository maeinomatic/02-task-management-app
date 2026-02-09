import { defineConfig } from 'vite'
import path from 'path'

// ESM Vite config to avoid the deprecated CJS Node API warning
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
    },
  },
  server: {
    port: 3000,
  },
})
