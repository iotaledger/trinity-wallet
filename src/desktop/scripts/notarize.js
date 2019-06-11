const { notarize } = require('electron-notarize');
const path = require('path');

const { version } = require('../package.json');

notarize({
    appBundleId: 'org.iota.trinity',
    appPath: path.resolve(__dirname, 'out', `trinity-desktop-${version}.dmg`),
    appleId: 'rajivshah1@icloud.com',
    appleIdPassword: '@keychain:Apple Developer Password',
    ascProvider: 'UG77RJKZHH',
}).then(() => {
    // eslint-disable-next-line no-console
    console.log('Notarization complete');
});
