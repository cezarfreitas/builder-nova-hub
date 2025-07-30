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
      "Cache-Control": "no-cache",
    },
    mime: {
      "application/javascript": ["js", "mjs"],
      "text/javascript": ["js"],
    },
  },
  build: {
    outDir: "dist/spa",
    cssCodeSplit: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Aggressive strategy: Keep React in main bundle always
        manualChunks: (id) => {
          // Force React ecosystem into main bundle
          if (id.includes('react') || id.includes('react-dom')) {
            return;
          }
          // Everything else can be chunked normally
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
        preset: "recommended",
      },
      external: (id) => {
        // Don't bundle these - load from CDN for better caching
        return false; // Keep everything bundled for now
      },
    },
    minify: "esbuild",
    target: ["es2020", "chrome80", "firefox78", "safari14"],
    sourcemap: false,
    reportCompressedSize: false,
    assetsInlineLimit: 4096, // Inline smaller assets
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  // Optimize dependencies - ensure React ecosystem is properly bundled
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react-router-dom",
      "react-dom/client",
    ],
    exclude: [], // Don't exclude anything that might cause issues
    force: true, // Force re-optimization to ensure React is properly bundled
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
