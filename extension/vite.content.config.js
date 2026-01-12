import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    plugins: [react()],
    define: {
        'process.env.NODE_ENV': '"production"',
    },
    build: {
        emptyOutDir: false, // Maintain previous build files
        outDir: 'dist',
        lib: {
            entry: resolve(__dirname, 'src/content/index.jsx'),
            name: 'ContentScript',
            fileName: () => 'assets/content.js',
            formats: ['iife'], // Force IIFE to bundle everything
        },
        rollupOptions: {
            output: {
                extend: true,
                // Ensure we don't code-split
                inlineDynamicImports: true,
            },
        },
    },
});
