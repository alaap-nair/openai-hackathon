import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5175,
    strictPort: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          'tesseract': ['tesseract.js']
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['tesseract.js']
  },
  define: {
    global: 'globalThis'
  }
})
