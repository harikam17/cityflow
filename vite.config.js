import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the build works from any sub-path (e.g. GitHub Pages /cityflow/)
  base: './',
  server: {
    port: 3000,
    open: false
  }
});
