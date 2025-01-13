import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// https://vite.dev/config/
export default defineConfig({
    base: '/',
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
    build: {
        assetsDir: '',
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'index.html'),
            },
            output: {
                chunkFileNames: 'js/[name]-[hash].js',
                entryFileNames: 'js/[name]-[hash].js',
                assetFileNames: function (_a) {
                    var name = _a.name;
                    if (/\.css$/.test(name !== null && name !== void 0 ? name : '')) {
                        return 'css/[name]-[hash][extname]';
                    }
                    return '[name]-[hash][extname]';
                }
            }
        },
        chunkSizeWarningLimit: 2000
    },
    publicDir: 'public'
});
