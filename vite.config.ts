import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: {
      'Cache-Control': 'no-cache',
    },
    mime: {
      'application/javascript': ['js', 'mjs'],
      'text/javascript': ['js'],
    },
  },
  build: {
    outDir: "dist/spa",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Simplified manual chunks for reliable build
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: [
            "lucide-react",
            "@radix-ui/react-dialog",
            "@radix-ui/react-toast",
          ],
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
    minify: true,
    target: "es2020",
    sourcemap: false,
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ["react", "react-dom"],
  },

  // CSS optimization
  css: {
    devSourcemap: false,
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
