const webpack = require('webpack');
const config = require('./config.base');

config.plugins = [
    new webpack.optimize.UglifyJsPlugin({
        compressor: {
            warnings: false
        }
    })
].concat(config.plugins);

module.exports = config;
