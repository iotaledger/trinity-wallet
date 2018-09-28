/*eslint-disable no-console*/
const reportBuild = require('bugsnag-build-reporter');
const { upload } = require('bugsnag-sourcemaps');
const { resolve } = require('path');
const { version } = require('./package.json');

const API_KEY = 'fakeAPIkey';

reportBuild(
    {
        apiKey: API_KEY,
        appVersion: version,
        releaseStage: 'production',
    },
    {
        path: resolve(__dirname, '../..'),
    },
)
    .then(() => console.log('Build successfully reported to Bugsnag'))
    .catch((err) => console.log('Build could not be reported to Bugsnag: ', err.messsage));

upload({
    apiKey: API_KEY,
    appVersion: version,
    publicPath: 'iota://dist/',
    sourceMap: resolve(__dirname, 'dist/bundle.js.map'),
    minifiedUrl: 'iota://dist/bundle.js',
    minifiedFile: resolve(__dirname, 'dist/bundle.js'),
    overwrite: true,
})
    .then(
        upload({
            apiKey: API_KEY,
            appVersion: version,
            publicPath: 'iota://dist/',
            sourceMap: resolve(__dirname, 'dist/css/main.css.map'),
            minifiedUrl: 'iota://dist/css/main.css',
            minifiedFile: resolve(__dirname, 'dist/css/main.css'),
            overwrite: true,
        }),
    )
    .then(() => console.log('Sourcemaps successfully uploaded to Bugsnag'))
    .catch((err) => console.log('Sourcemaps could not uploaded to Bugsnag: ', err.messsage));
