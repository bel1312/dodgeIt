import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/dodgeIt/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
