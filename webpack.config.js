const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/index.ts', // <-- (1)
    node: {
        fs: 'empty'
      },   
    resolve: {
        extensions: [".ts", ".js"],
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

