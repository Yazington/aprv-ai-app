import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Ensure this matches your OAuth origin
    port: 5173, // Ensure this matches your OAuth origin
    // If you need to access via LAN, set host to '0.0.0.0'
    // host: '0.0.0.0',
  },
  build: {
    outDir: 'dist', // Specify output directory if needed
    sourcemap: false, // Disable sourcemaps for production to reduce size
    // Additional production-specific settings
  },
});
