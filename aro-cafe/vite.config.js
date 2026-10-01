import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // the stylesheet is hand-tuned (fallback pairs like 100vh then 100svh); ship it exactly as written
    cssMinify: false,
    // three.js is loaded on demand (only for the scroll hero) and is simply a large library
    chunkSizeWarningLimit: 700,
  },
});
