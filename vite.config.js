import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Relative base so the built app works at domain root, a /repo/ subpath
  // (GitHub Pages), and behind the local sync server alike.
  base: './',
  // Excalidraw's library bundle occasionally touches process.env at runtime.
  define: {
    'process.env': 'window.process?.env || {}',
  },
  optimizeDeps: {
    include: [],
  },
  server: {
    host: true,
    port: 5173,
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 5200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@excalidraw') || id.includes('excalidraw')) return 'excalidraw';
          if (id.includes('pdfjs-dist')) return 'pdf';
        },
      },
    },
  },
})