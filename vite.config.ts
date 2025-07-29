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
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Optimized manual chunks to reduce unused code
        manualChunks: {
          // Core React
          react: ["react", "react-dom"],
          // Router (só carrega quando necessário)
          router: ["react-router-dom"],
          // UI components (lazy load)
          ui: [
            "lucide-react",
            "@radix-ui/react-dialog",
            "@radix-ui/react-toast",
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
          ],
          // Charts (só para admin)
          charts: ["chart.js", "react-chartjs-2"],
          // Utilities
          utils: ["date-fns", "clsx", "tailwind-merge"],
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
      },
    },
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info"],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
    },
    target: "es2020",
    sourcemap: false,
    reportCompressedSize: false,
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
