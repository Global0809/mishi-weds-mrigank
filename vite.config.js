import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Two build modes:
//   npm run build         -> normal dist/ (hostable: GitHub Pages, Netlify, etc.)
//   npm run build:single  -> dist-single/index.html, one self-contained file to send to people
const single = process.env.SINGLE === '1';

export default defineConfig({
  base: './',
  plugins: single ? [viteSingleFile()] : [],
  build: {
    outDir: single ? 'dist-single' : 'dist',
    emptyOutDir: true,
    ...(single
      ? { assetsInlineLimit: 100000000, cssCodeSplit: false, chunkSizeWarningLimit: 100000 }
      : {}),
  },
});
