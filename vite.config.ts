import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost', // Ensure this matches your OAuth origin
    port: 5174, // Ensure this matches your OAuth origin
    // If you need to access via LAN, set host to '0.0.0.0'
    // host: '0.0.0.0',
  },
});
