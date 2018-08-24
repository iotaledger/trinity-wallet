const config = require('./config.base');

const buildTarget = process.env.BUILD_TARGET || 'main';

config.target = 'web';
config.mode = 'production';

if (buildTarget === 'styleguide') {
    config.entry = ['babel-polyfill', './src/guide/index.js'];
}

config.output.publicPath = '../dist/';

config.devtool = 'source-map';

module.exports = config;
