const webpack = require('webpack');
const config = require('./config.base');

config.plugins = [
    new webpack.optimize.UglifyJsPlugin({
        compressor: {
            warnings: false,
        },
    }),
].concat(config.plugins);

// config.node = {
//     __dirname: false,
//     __filename: false
// };

config.target = 'electron-renderer';

config.output.publicPath = '../dist/';
config.output.pathinfo = false;

module.exports = config;
