const webpack = require('webpack');
const path = require('path');
const config = require('./config.base');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');

config.devtool = 'eval-source-map';

config.entry = ['webpack-hot-middleware/client?reload=true', 'react-error-overlay'].concat(config.entry);

config.plugins = [
    new webpack.HotModuleReplacementPlugin(),
    new WatchMissingNodeModulesPlugin(path.resolve(path.join(__dirname, '..', 'node_modules'))),
].concat(config.plugins);

config.devServer = {
    contentBase: './dist',
    hot: true,
};

module.exports = config;
