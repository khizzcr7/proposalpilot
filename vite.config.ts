import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import path from "node:path";

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Only the Node builtins the framework's action graph references
      // (url, path, crypto, stream, buffer, process). The database driver
      // is aliased to a stub below because pure actions never open a DB.
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      postgres: path.resolve(__dirname, "src/stubs/postgres.ts"),
      "node:async_hooks": path.resolve(__dirname, "src/stubs/async_hooks.ts"),
      async_hooks: path.resolve(__dirname, "src/stubs/async_hooks.ts"),
    },
  },
});
