const path = require('path');
const { dependencies } = require('../package.json');

module.exports = {
    externals: [...Object.keys(dependencies || {})],
    mode: 'production',
    target: 'electron-main',
    entry: {
        main: './main.js',
        preloadDev: './native/preload/development.js',
        preloadProd: './native/preload/production.js',
        preloadTray: './native/preload/tray.js',
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
        ],
    },
    resolve: {
        modules: ['node_modules', path.resolve(__dirname, '..', 'src'), path.resolve(__dirname, '..', '..', 'shared')],
    },
    output: {
        path: path.join(__dirname, '..', 'dist'),
        filename: '[name].js',
        libraryTarget: 'commonjs2',
    },

    resolve: {
        extensions: ['.js', '.jsx', '.json'],
    },
};
