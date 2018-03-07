const webpack = require('webpack');
const config = require('./config.base');

const buildTarget = process.env.BUILD_TARGET || 'main';

config.target = 'web';

if (buildTarget === 'styleguide') {
    config.entry = ['babel-polyfill', './src/guide/index.js'];
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
