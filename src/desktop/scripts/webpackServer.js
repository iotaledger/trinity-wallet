const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 1074;

const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpack = require('webpack');
const config = require('../webpack.config/config.app');

const compiler = webpack(config);
const devMode = process.env.NODE_ENV !== 'production';

const webpackDev = webpackDevMiddleware(compiler, {
    noInfo: false,
    publicPath: config.output.publicPath,
    stats: {
        colors: true,
    },
});
app.use(webpackDev);

if (devMode) {
    const webpackHot = webpackHotMiddleware(compiler);
    app.use(webpackHot);
}

app.use(express.static(compiler.outputPath));

app.use('*', (_req, res, next) => {
    const filename = path.join(compiler.outputPath, 'index.html');
    compiler.outputFileSystem.readFile(filename, (err, result) => {
        if (err) {
            return next(err);
        }
        res.set('content-type', 'text/html');
        res.send(result);
        res.end();
    });
});

app.listen(PORT, (error) => {
    if (error) {
        console.error(error); /* eslint-disable-line no-console */
    } else {
        console.info('=> 🌎 http://localhost:%s/', PORT); /* eslint-disable-line no-console */
    }
});

module.exports = { PORT, webpackDev };
