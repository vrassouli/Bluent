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