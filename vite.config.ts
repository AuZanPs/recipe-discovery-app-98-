import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config adjusted for GitHub Pages deployment.
// The base must match the repository name so assets resolve correctly when served from /<repo>/.
export default defineConfig({
  base: '/recipe-discovery-app-98-/',
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist', // explicit (Vite default) for clarity
    emptyOutDir: true,
  },
});