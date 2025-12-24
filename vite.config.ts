import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs';

// Copy public files to dist after build
const copyPublicPlugin = () => ({
  name: 'copy-public',
  closeBundle() {
    // Copy manifest
    copyFileSync('public/manifest.json', 'dist/manifest.json');

    // Copy icons
    if (!existsSync('dist/icons')) {
      mkdirSync('dist/icons', { recursive: true });
    }
    const icons = readdirSync('public/icons');
    icons.forEach((icon: string) => {
      copyFileSync(`public/icons/${icon}`, `dist/icons/${icon}`);
    });

    console.log('Copied manifest.json and icons to dist/');
  },
});

export default defineConfig({
  plugins: [react(), copyPublicPlugin()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/content/index.tsx'),
        background: resolve(__dirname, 'src/background/index.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: 'content.[ext]',
        manualChunks: undefined,
      },
    },
    cssCodeSplit: false,
    minify: true,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});
