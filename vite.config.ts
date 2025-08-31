import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Prevent vitest from being included in browser builds
    'import.meta.vitest': 'undefined',
  },
  optimizeDeps: {
    exclude: ['vitest']
  },
  build: {
    rollupOptions: {
      external: (id) => {
        // Exclude test-related files and vitest from build
        return id.includes('/test/') || 
               id.includes('/__tests__/') || 
               id.includes('.test.') ||
               id.includes('.spec.') ||
               id === 'vitest' ||
               id.startsWith('vitest/');
      }
    }
  }
}));
