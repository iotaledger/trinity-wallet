const config = require('./config.base');

const buildTarget = process.env.BUILD_TARGET || 'main';

config.target = 'web';

if (buildTarget === 'styleguide') {
    config.entry = ['babel-polyfill', './src/guide/index.js'];
}

config.output.publicPath = '../dist/';

module.exports = config;
