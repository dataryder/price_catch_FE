import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
// Tailwind runs through postcss.config.js (no Astro integration needed).
export default defineConfig({
  site: 'https://pricecatcher.civictech.my',
  integrations: [react(), sitemap()],
  output: 'static',
  vite: {
    optimizeDeps: {
      exclude: ['parquet-wasm']
    },
    build: {
      target: 'esnext'
    }
  }
});
