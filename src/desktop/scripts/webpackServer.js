const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 1074;

const useHotReload = process.argv.indexOf('hot') > -1;

const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpack = require('webpack');
const config = require('../webpack.config/config.app');

const compiler = webpack(config);

const webpackDev = webpackDevMiddleware(compiler, {
    noInfo: false,
    publicPath: config.output.publicPath,
    stats: {
        colors: true,
    },
});

app.use(webpackDev);

const webpackHot = webpackHotMiddleware(compiler);

if (useHotReload) {
    app.use(webpackHot);
}

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (_request, response) => {
    response.sendFile(path.join(__dirname, '../dist/index.html'));
});

const instance = app.listen(PORT, (error) => {
    if (error) {
        console.error(error); /* eslint-disable-line no-console */
    } else {
        console.info('=> 🌎 http://localhost:%s/', PORT); /* eslint-disable-line no-console */
    }
});

const close = () => {
    webpackDev.close();
    instance.close();

    if (useHotReload) {
        webpackHot.close();
    }
};

module.exports = { close, PORT, webpackDev };
