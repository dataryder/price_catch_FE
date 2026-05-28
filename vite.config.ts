import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["parquet-wasm"],
  },
  build: {
    target: "esnext", // Required for top-level await if used by parquet-wasm
  },
});
