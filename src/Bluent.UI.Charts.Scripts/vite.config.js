import { resolve } from 'path'
import { defineConfig } from 'vite'
import { viteCommonjs } from "@originjs/vite-plugin-commonjs"
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
    base: './',
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'Bluent.UI.Charts',
            // the proper extensions will be added
            fileName: 'bluent.ui.charts',
        },
        rollupOptions: {
            output: {
                inlineDynamicImports: true,
                format: 'es'
            },
            plugins: [

            ],
        },
        //minify: 'terser'
    },
    worker: {
        format: 'es', // Use ES modules for workers
    },
    plugins: [
        viteCommonjs(), viteSingleFile()
    ],
    optimizeDeps: {
    },
})