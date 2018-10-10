const config = require('./config.base');

config.target = 'web';
config.mode = 'production';

config.output.publicPath = '../dist/';

config.devtool = 'source-map';

module.exports = config;
