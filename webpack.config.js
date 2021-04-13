const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/index.ts', // <-- (1)
    resolve: {
        extensions: [".ts", ".js"],
        fallback: { 
            "path": false,
            "crypto": false,
            "fs": false
        }
    },
    module: {
        rules: [
            { test: /\.ts$/, loader: 'ts-loader' },
        ],
    },
    output: {
        filename: 'index.js', // <-- (2)
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'umd',
        globalObject: 'typeof self !== \'undefined\' ? self : this'
    },
};

