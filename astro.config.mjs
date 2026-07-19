import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://pricecatcher.civictech.my',
  integrations: [
    react(),
    tailwind({
      configFile: './tailwind.config.js'
    }),
    sitemap()
  ],
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
