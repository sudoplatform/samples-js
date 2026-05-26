import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'crypto', 'stream', 'util', 'path', 'os', 'zlib', 'events', 'querystring', 'url', 'assert', 'vm'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress missing export warnings from node_modules (type-only imports)
        if (warning.code === 'MISSING_EXPORT' && warning.id?.includes('node_modules')) {
          return
        }
        warn(warning)
      },
    },
  },
  // Treat .private and .id files as raw text assets
  assetsInclude: ['**/*.private', '**/*.id'],
  resolve: {
    tsconfigPaths: true,
    alias: {
      '@aws-sdk/credential-providers': '@aws-sdk/credential-providers/dist-es/index.browser.js',
    },
  },
  define: {
    global: 'globalThis',
  },
})
