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
  build: {
    rollupOptions: {
      external: [
        /\/test\//,
        /__tests__/, 
        /\.test\./,
        /\.spec\./,
        'vitest',
        '@vitest/runner',
        '@vitest/utils',
      ],
    },
  },
  define: {
    // Prevent vitest from being included in browser builds
    'import.meta.vitest': 'undefined',
  },
  optimizeDeps: {
    exclude: ['vitest']
  }
}));
