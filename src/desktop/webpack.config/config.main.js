const path = require('path');
const { dependencies } = require('../package.json');

module.exports = {
    externals: [...Object.keys(dependencies || {})],
    mode: 'production',
    target: 'electron-main',
    entry: {
        main: './native/Index.js',
        preloadDev: './native/preload/development.js',
        preloadProd: './native/preload/production.js',
        Entangled: './native/libs/Entangled.js',
        preloadTray: './native/preload/tray.js',
    },
    optimization: {
        minimize: false,
    },
    node: {
        __dirname: false,
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
        extensions: ['.js', '.jsx', '.json'],
    },
    output: {
        path: path.join(__dirname, '..', 'dist'),
        filename: '[name].js',
        libraryTarget: 'commonjs2',
    },
};
