import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    // Assets under public/ keep their original URLs (/assets/images/...) so
    // existing external links, OG tags and search results stay valid.
    assetsDir: 'build',
  },
  server: {
    port: 3000,
    open: true,
  },
});
