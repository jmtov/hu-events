import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  server: {
    // Proxy /api to the Vercel dev server so that `npm run dev` (plain Vite)
    // works alongside `vercel dev --listen 3000` for the serverless functions.
    // When using `npm start` (vercel dev) this proxy is not active.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  plugins: [
    tailwindcss(),
    TanStackRouterVite(),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
