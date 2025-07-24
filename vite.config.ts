import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    outDir: "dist/spa",
    cssCodeSplit: true, // Enable CSS code splitting
    rollupOptions: {
      output: {
        // Manual chunks to reduce bundle size more aggressively
        manualChunks: (id) => {
          // React core
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }

          // Admin-only components
          if (id.includes('/admin/') || id.includes('chart.js') || id.includes('xlsx')) {
            return 'admin-lazy';
          }

          // UI components that can be lazy loaded
          if (id.includes('@radix-ui') || id.includes('lucide-react')) {
            return 'ui-components';
          }

          // Router and utilities
          if (id.includes('react-router') || id.includes('date-fns')) {
            return 'router-utils';
          }

          // Large external libraries
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        // Optimize chunk size and naming
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name.split('.').at(1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(extType)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production'
      }
    }
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
    include: [
      'react',
      'react-dom',
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-toast'
    ]
  }
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
