import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite configuration
 * Configures the build process and development server for the React application
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  resolve: {
    alias: {
      // Add any path aliases if needed
    },
  },
});