const settings = require('../package.json');
const config = require('./config.base');

const { BugsnagSourceMapUploaderPlugin } = require('webpack-bugsnag-plugins');

const buildTarget = process.env.BUILD_TARGET || 'main';
const skipSourcemaps = process.env.SKIP_SOURCEMAPS || false;

config.target = 'web';
config.mode = 'production';

if (buildTarget === 'styleguide') {
    config.entry = ['babel-polyfill', './src/guide/index.js'];
}

config.output.publicPath = '../dist/';

config.devtool = 'source-map';

if (skipSourcemaps) {
  config.plugins = [
      new BugsnagSourceMapUploaderPlugin({
          apiKey: '53981ba998df346f6377ebbeb1da46d3',
          appVersion: settings.version,
          publicPath: 'iota://dist/',
      }),
  ].concat(config.plugins);
}

module.exports = config;
