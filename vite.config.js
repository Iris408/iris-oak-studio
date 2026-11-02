import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        // Full portfolio, served at /portfolio (see vercel.json cleanUrls)
        portfolio: resolve(__dirname, 'portfolio.html'),
        // Standalone sample: Website Care Report (fictional client)
        careReport: resolve(__dirname, 'care-report.html'),
        // Standalone sample: Client Portal dashboard (fictional client)
        clientPortal: resolve(__dirname, 'client-portal.html'),
        // Privacy Policy, served at /privacy (see vercel.json cleanUrls)
        privacy: resolve(__dirname, 'privacy.html'),
        // Portfolio Partnership, served at /portfolio-partnership
        partnership: resolve(__dirname, 'portfolio-partnership.html'),
        // Not-found page; Vercel serves 404.html for unmatched routes
        notFound: resolve(__dirname, '404.html'),
      },
    },
  },
});
