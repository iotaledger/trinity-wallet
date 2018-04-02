const config = require('./config.base');

const { BugsnagSourceMapUploaderPlugin } = require('webpack-bugsnag-plugins');

const buildTarget = process.env.BUILD_TARGET || 'main';

config.target = 'web';

if (buildTarget === 'styleguide') {
    config.entry = ['babel-polyfill', './src/guide/index.js'];
}

config.output.publicPath = '../dist/';

config.devtool = 'source-map';

config.plugins = [
    new BugsnagSourceMapUploaderPlugin({
        apiKey: '53981ba998df346f6377ebbeb1da46d3',
        appVersion: '0.1.1',
        publicPath: 'iota://dist/',
    }),
].concat(config.plugins);

module.exports = config;
