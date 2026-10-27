import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        // Standalone sample: Website Care Report (fictional client)
        careReport: resolve(__dirname, 'care-report.html'),
        // Standalone sample: Client Portal dashboard (fictional client)
        clientPortal: resolve(__dirname, 'client-portal.html'),
        // Privacy Policy, served at /privacy (see vercel.json cleanUrls)
        privacy: resolve(__dirname, 'privacy.html'),
      },
    },
  },
});
