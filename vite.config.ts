import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import type { ConfigEnv, UserConfig } from 'vite'
import { loadEnv } from 'vite'

const pathResolve = (dir: string): any => {
    return resolve(__dirname, '.', dir)
}

const viteConfig = ({ mode }: ConfigEnv): UserConfig => {
    const { VITE_PORT, VITE_OPEN, VITE_BASE_PATH, VITE_OUT_DIR, VITE_RBAC_BASE_URL } = loadEnv(mode, process.cwd())

    const alias: Record<string, string> = {
        '/@': pathResolve('./src/'),
        assets: pathResolve('./src/assets'),
        'vue-i18n': mode === 'production' ? 'vue-i18n/dist/vue-i18n.cjs.prod.js' : 'vue-i18n/dist/vue-i18n.cjs.js',
    }

    return {
        plugins: [vue()],
        root: process.cwd(),
        resolve: { alias },
        base: VITE_BASE_PATH,
        server: {
            host: true,
            port: parseInt(VITE_PORT),
            open: VITE_OPEN != 'false',
            proxy: {
                '/rbacServer': {
                    target: VITE_RBAC_BASE_URL,
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/rbacServer/, ''),
                },
            },
        },
        build: {
            cssCodeSplit: false,
            sourcemap: false,
            outDir: VITE_OUT_DIR,
            emptyOutDir: true,
            chunkSizeWarningLimit: 1500,
            rollupOptions: {
                output: {
                    manualChunks: {
                        vue: ['vue', 'vue-router', 'pinia', 'vue-i18n', 'element-plus'],
                    },
                },
            },
        },
    }
}

export default viteConfig
