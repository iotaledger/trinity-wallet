const webpack = require('webpack');
const path = require('path');
const config = require('./config.base');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');

config.devtool = 'eval-source-map';

const buildTarget = process.env.BUILD_TARGET || 'main';

const buildEntry = buildTarget === 'styleguide' ? './src/guide/index.js' : config.entry;

config.entry = ['webpack-hot-middleware/client?reload=true', 'react-error-overlay'].concat(buildEntry);

config.plugins = [
    new webpack.HotModuleReplacementPlugin(),
    new WatchMissingNodeModulesPlugin(path.resolve(path.join(__dirname, '..', 'node_modules'))),
].concat(config.plugins);

config.devServer = {
    contentBase: './dist',
    hot: true,
};

module.exports = config;
