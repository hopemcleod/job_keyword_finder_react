import { createFilter, defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function removeUseClient() {
  const filter = createFilter(/.*\.(js|ts|jsx|tsx)$/);

  return {
    name: 'remove-use-client',

    transform(code: string, id: string) {
      if (!filter(id)) {
        return null;
      }

      const newCode = code.replace(/['"]use client['"];\s*/g, '');

      return  { code: newCode, map: null };
    },
  };
}

export default defineConfig({
  plugins: [react(), removeUseClient()],
  build: {
    sourcemap: true,  // Enable source maps for debugging
    rollupOptions: {
      input: {
        content: 'src/content.tsx',
        background: 'src/background.ts',
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name].js',  // Keep dynamic chunks in a 'chunks/' folder without hashes.
        assetFileNames: 'assets/[name].[ext]'  // Organize assets like images or CSS in an 'assets/' folder.
      }
    },
    outDir: 'dist',  // Ensure the output directory is 'dist'
  }
});