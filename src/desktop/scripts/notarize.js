const { notarize } = require('electron-notarize');
const path = require('path');

const { version } = require('../package.json');

// The Apple ID to be used to upload the app for notarization
const APPLE_ID = process.env.TRINITY_APPLE_ID;

// The name of the keychain identity that contains the password
// This is not the same as the password itself!
const APPLE_ID_IDENTITY_NAME = process.env.TRINITY_APPLE_ID_IDENTITY;

if (!APPLE_ID) {
  throw Error('Notarization failed: Environment variable "TRINITY_APPLE_ID" is not defined');
}

if (!APPLE_ID_IDENTITY_NAME) {
  throw Error('Notarization failed: Environment variable "TRINITY_APPLE_ID_IDENTITY" is not defined');
}

notarize({
    appBundleId: 'org.iota.trinity',
    appPath: path.resolve(__dirname, '..', 'out', `trinity-desktop-${version}.dmg`),
    appleId: APPLE_ID,
    appleIdPassword: `@keychain:${APPLE_ID_IDENTITY_NAME}`,
    ascProvider: 'UG77RJKZHH',
})
.then(() => {
    // eslint-disable-next-line no-console
    console.log('Notarization complete');
})
.catch((error) => {
    // eslint-disable-next-line no-console
    console.log(error);
});
