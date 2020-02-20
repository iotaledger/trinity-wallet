const { notarize } = require('electron-notarize');
const path = require('path');

exports.default = async () => {
    if (process.platform !== 'darwin') {
        return true;
    }

    const APPLE_ID = process.env.TRINITY_APPLE_ID;
    const APPLE_ID_IDENTITY_NAME = process.env.TRINITY_APPLE_ID_IDENTITY;

    if (!APPLE_ID) {
        throw Error('Notarization failed: Environment variable "TRINITY_APPLE_ID" is not defined');
    }

    if (!APPLE_ID_IDENTITY_NAME) {
        throw Error('Notarization failed: Environment variable "TRINITY_APPLE_ID_IDENTITY" is not defined');
    }

    await notarize({
        appBundleId: 'org.iota.trinity',
        appPath: path.resolve(__dirname, '../out/mac/Trinity-RC.app'),
        appleId: APPLE_ID,
        appleIdPassword: `@keychain:${APPLE_ID_IDENTITY_NAME}`,
        ascProvider: 'UG77RJKZHH',
    });
};
