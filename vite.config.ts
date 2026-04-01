import { defineConfig } from 'vite';
import path from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/shared/index.ts'),
        shared: path.resolve(__dirname, 'src/shared/index.ts'),
        ui: path.resolve(__dirname, 'src/ui/admin/index.ts'), // UI entry will need consolidation later
        api: path.resolve(__dirname, 'src/api/index.ts'),
        prerender: path.resolve(__dirname, 'src/prerender/index.ts')
      },
      formats: ['es']
    },
    rollupOptions: {
      external: ['lit', 'lit/decorators.js', '@leadertechie/md2html', '@leadertechie/r2tohtml'],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    },
    outDir: 'dist',
    minify: false
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ['src'],
      exclude: ['src/**/*.test.ts', 'src/**/__tests__/**']
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
});
