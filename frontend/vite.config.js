import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    css: {
        postcss: './postcss.config.js',
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
        },
    },
    build: {
        assetsInlineLimit: 0, // Отключение инлайнинга для больших файлов
        rollupOptions: {
            output: {
                entryFileNames: 'assets/[name].[hash].js', // Для JS
                chunkFileNames: 'assets/[name].[hash].js', // Для чанков
                assetFileNames: 'assets/[name].[hash][extname]', // Для статики (например, изображений)
            },
        },
    },
});
