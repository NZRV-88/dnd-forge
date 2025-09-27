import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: [
        "."
      ],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin(), svgr()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@src": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "./shared"),
      },
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);
    },
  };
}