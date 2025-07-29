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
        // Simplified chunks to prevent createContext issues
        manualChunks: (id) => {
          // Keep React ecosystem in main bundle to avoid dependency issues
          if (id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('@radix-ui') ||
              id.includes('lucide-react')) {
            return; // Let these go to main bundle
          }

          // Charts - only used in admin (safe to separate)
          if (id.includes('chart') || id.includes('recharts')) {
            return 'charts';
          }

          // Pure utilities without React dependencies
          if (id.includes('date-fns') ||
              id.includes('clsx') ||
              id.includes('tailwind-merge')) {
            return 'utils';
          }

          // Admin pages (lazy loaded, so safe)
          if (id.includes('/pages/admin/')) {
            return 'admin';
          }

          // Everything else from node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
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
  // Optimize dependencies - ensure React ecosystem is properly bundled
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react-router-dom"
    ],
    exclude: [], // Don't exclude anything that might cause issues
    force: false // Let Vite handle this naturally
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
