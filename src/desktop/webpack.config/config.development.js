const webpack = require('webpack');
const config = require('./config.base');

config.devtool = 'eval-source-map';
config.mode = 'development';

config.entry = ['webpack-hot-middleware/client?reload=true'].concat(config.entry);

config.plugins = [new webpack.HotModuleReplacementPlugin()].concat(config.plugins);

config.devServer = {
    contentBase: './dist',
    hot: true,
};

module.exports = config;
