import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/dodgeIt/",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    target: 'es2015', // Changed from 'esnext' for better compatibility
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: undefined,
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name.split('.').at(1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `assets/images/[name]-[hash].[ext]`;
          }
          if (/css/i.test(extType)) {
            return `assets/[name]-[hash].[ext]`;
          }
          return `assets/[name]-[hash].[ext]`;
        }
      },
    },
  },
  server: {
    host: true,
    port: 5173
  },
  // Add this to help with GitHub Pages CSS loading
  esbuild: {
    charset: 'utf8'
  },
  // Ensure proper MIME types
  optimizeDeps: {
    include: []
  }
});
