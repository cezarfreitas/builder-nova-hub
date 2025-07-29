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
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Conservative manual chunks to avoid createContext issues
        manualChunks: (id) => {
          // Keep React and React-DOM together in the main bundle to ensure availability
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }

          // Put all node_modules (except React) in vendor
          if (id.includes('node_modules')) {
            return 'vendor';
          }

          // Admin pages in separate chunk
          if (id.includes('/pages/admin/')) {
            return 'admin';
          }
        },
        chunkFileNames: (chunkInfo) => {
          // Better chunk naming for caching
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/${chunkInfo.name}-[hash].js`;
        },
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
        preset: 'recommended'
      },
      external: (id) => {
        // Don't bundle these - load from CDN for better caching
        return false; // Keep everything bundled for now
      }
    },
    minify: 'esbuild',
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
  // Optimize dependencies - ensure React is loaded first
  optimizeDeps: {
    include: ["react", "react-dom", "react/jsx-runtime"],
    force: true
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
