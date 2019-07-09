/*eslint-disable no-console*/
const reportBuild = require('bugsnag-build-reporter');
const { resolve } = require('path');
const { version } = require('./package.json');

const API_KEY = process.env.BUGSNAG_KEY;

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
