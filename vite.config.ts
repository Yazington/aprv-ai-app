import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Ensure this matches your OAuth origin
    port: 5173, // Ensure this matches your OAuth origin
    headers: {
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
  build: {
    outDir: 'dist', // Specify output directory if needed
    sourcemap: false, // Disable sourcemaps for production to reduce size
    // Additional production-specific settings
  },
});
