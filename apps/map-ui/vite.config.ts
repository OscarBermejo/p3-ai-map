/// <reference types="vite/client" />
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const mapUiDir = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = path.resolve(mapUiDir, "../..");

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
  resolve: {
    alias: {
      "@repo": repoRoot,
    },
  },
});
