import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default defineConfig({
  plugins: [svelte()],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        content: resolve(__dirname, 'src/content.js'),
        background: resolve(__dirname, 'src/background.js')
      },
      output: {
        entryFileNames: 'src/[name].js',
        chunkFileNames: 'src/chunks/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
}); 