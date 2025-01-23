import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Ensure this matches your OAuth origin
    port: 5173, // Ensure this matches your OAuth origin
  },
  build: {
    outDir: 'dist', // Specify output directory if needed
    sourcemap: false, // Disable sourcemaps for production to reduce size
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
