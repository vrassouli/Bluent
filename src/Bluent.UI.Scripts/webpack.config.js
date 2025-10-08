const path = require('path');

module.exports = {
    entry: './src/index.ts',
    mode: 'production',
    module: {
        rules: [
            {
                                    test: /\.tsx?$/,
                                    use: 'ts-loader',
                                    exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'bluent.ui.js',
        path: path.resolve(__dirname, 'dist'),
        sourceMapFilename: "[file].map",
        library: {
            type: "module",
        },
    },
    experiments: {
        outputModule: true
    },
    devtool: 'source-map'
    };

    // Shared module rule config
    const tsRule = {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
    };

    // Base resolve
    const resolve = { extensions: ['.tsx', '.ts', '.js'] };

    // 1) ESM build (for dynamic import / JSRuntime import("..."))
    const esmConfig = {
        name: 'esm',
        entry: './src/index.ts',
        mode: 'production',
        module: { rules: [tsRule] },
        resolve,
        output: {
            filename: 'bluent.ui.js',
            path: path.resolve(__dirname, 'dist'),
            sourceMapFilename: '[file].map',
            library: { type: 'module' },
            chunkFormat: 'module'
        },
        experiments: { outputModule: true },
        devtool: 'source-map'
    };

    // 2) Global build (attached to window.BluentUI) for plain <script> (SSR static, legacy, or when type="module" not desired)
    const globalConfig = {
        name: 'global',
        entry: './src/index.ts',
        mode: 'production',
        module: { rules: [tsRule] },
        resolve,
        output: {
            filename: 'bluent.ui.global.js',
            path: path.resolve(__dirname, 'dist'),
            sourceMapFilename: '[file].map',
            library: { name: 'BluentUI', type: 'window' },
            // Ensures no "export" syntax appears in this bundle
            environment: { module: false }
        },
        devtool: 'source-map'
    };

    module.exports = [esmConfig, globalConfig];