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
                assetFileNames: function (assetInfo) {
                    var _a;
                    var info = ((_a = assetInfo.source) === null || _a === void 0 ? void 0 : _a.toString()) || '';
                    var isCss = info.includes('sourceMappingURL') && info.includes('/*');
                    return isCss ? 'css/[name]-[hash][extname]' : '[name]-[hash][extname]';
                }
            }
        },
        chunkSizeWarningLimit: 2000
    },
    publicDir: 'public'
});
