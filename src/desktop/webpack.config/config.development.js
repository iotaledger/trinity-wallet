const webpack = require('webpack');
const config = require('./config.base');

config.devtool = 'eval-source-map';
config.mode = 'development';

const buildTarget = process.env.BUILD_TARGET || 'main';

const buildEntry = buildTarget === 'styleguide' ? './src/guide/index.js' : config.entry;

config.entry = ['webpack-hot-middleware/client?reload=true', 'react-error-overlay'].concat(buildEntry);

config.plugins = [new webpack.HotModuleReplacementPlugin()].concat(config.plugins);

config.devServer = {
    contentBase: './dist',
    hot: true,
};

module.exports = config;
