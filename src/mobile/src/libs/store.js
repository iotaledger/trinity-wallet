import get from 'lodash/get';
import { getVersion, getBuildNumber } from 'react-native-device-info';
import { doesSaltExistInKeychain } from 'libs/keychain';
import { purge } from 'shared-modules/storage';
import { setAppVersions, resetWallet } from 'shared-modules/actions/settings';

/**
 * Checks if app version/build number has changed
 * @method shouldMigrate
 *
 * @param {object} restoredState
 * @returns {boolean}
 */
const shouldMigrate = (restoredState) => {
    const restoredVersion = get(restoredState, 'settings.versions.version');
    const restoredBuildNumber = get(restoredState, 'settings.versions.buildNumber');

    const currentVersion = getVersion();
    const currentBuildNumber = getBuildNumber();

    return restoredVersion !== currentVersion || restoredBuildNumber !== currentBuildNumber;
};

/**
 * Resets the wallet if the keychain is empty
 * Fixes issues related to iCloud backup
 * @param {object} store
 *
 * @returns {Promise<object>}
 *
 */
export const resetIfKeychainIsEmpty = (store) => {
    return doesSaltExistInKeychain().then((exists) => {
        if (!exists) {
            return purge().then(() => {
                store.dispatch(resetWallet());
                // Set the new app version
                store.dispatch(
                    setAppVersions({
                        version: getVersion(),
                        buildNumber: getBuildNumber(),
                    }),
                );

                return store;
            });
        }

        return store;
    });
};

/**
 * Migrates application state
 * @method migrate
 *
 * @param {object} store - redux store object
 * @returns {Promise<any>}
 */
export const migrate = (store) => {
    /* eslint-disable no-unused-vars */
    const hasAnUpdate = shouldMigrate(store.getState());
    /* eslint-enable no-unused-vars */

    store.dispatch(
        setAppVersions({
            version: getVersion(),
            buildNumber: getBuildNumber(),
        }),
    );

    return Promise.resolve(store);
};
