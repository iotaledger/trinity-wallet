const webpack = require('webpack');
const config = require('./config.base');

const buildTarget = process.env.BUILD_TARGET || 'main';

if (buildTarget === 'styleguide') {
    config.entry = ['babel-polyfill', './src/guide/index.js'];
    config.target = 'web';
} else {
    config.target = 'electron-renderer';
}

config.plugins = [
    new webpack.optimize.UglifyJsPlugin({
        compressor: {
            warnings: false,
        },
    }),
].concat(config.plugins);

config.output.publicPath = '../dist/';
config.output.pathinfo = false;

module.exports = config;
