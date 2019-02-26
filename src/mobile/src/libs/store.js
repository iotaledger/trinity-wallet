import get from 'lodash/get';
import head from 'lodash/head';
import last from 'lodash/last';
import filter from 'lodash/filter';
import includes from 'lodash/includes';
import split from 'lodash/split';
import transform from 'lodash/transform';
import { AsyncStorage } from 'react-native';
import { getVersion, getBuildNumber } from 'react-native-device-info';
import { doesSaltExistInKeychain } from 'libs/keychain';
import { reinitialise as reinitialiseStorage } from 'shared-modules/storage';
import { getEncryptionKey } from 'libs/realm';
import { setAppVersions, resetWallet } from 'shared-modules/actions/settings';
import { parse, fetchVersions } from 'shared-modules/libs/utils';
import { shouldUpdate as triggerShouldUpdate, forceUpdate as triggerForceUpdate } from 'shared-modules/actions/wallet';

/**
 * AsyncStorage adapter for manipulating state persisted by redux-persist (https://github.com/rt2zz/redux-persist)
 */
export const reduxPersistStorageAdapter = {
    /**
     * Filters keys that do not have "reduxPersist:" prefix.
     *
     * @method _filterIrrelevantKeys
     * @param {array} keys
     *
     * @returns {array}
     */
    _filterIrrelevantKeys(keys) {
        return filter(keys, (key) => includes(key, 'reduxPersist:'));
    },
    /**
     * Gets all keys stored in AsyncStorage
     *
     * @method getKeys
     *
     * @returns {Promise<array>}
     */
    getKeys() {
        return new Promise((resolve, reject) => {
            AsyncStorage.getAllKeys((error, keys) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(keys);
                }
            });
        });
    },
    /**
     * Gets data persisted by redux-persist (https://github.com/rt2zz/redux-persist) in AsyncStorage
     *
     * @method get
     *
     * @returns {Promise<object>}
     */
    get() {
        return this.getKeys().then((keys) => {
            return new Promise((resolve, reject) => {
                AsyncStorage.multiGet(this._filterIrrelevantKeys(keys), (error, data) => {
                    if (error) {
                        reject(error);
                    } else {
                        // multiGet(['k1', 'k2'], cb) -> cb([['k1', 'val1'], ['k2', 'val2']])
                        // https://facebook.github.io/react-native/docs/asyncstorage#multiget
                        resolve(
                            transform(
                                data,
                                (acc, value) => {
                                    acc[last(split(head(value), ':'))] = parse(last(value));
                                },
                                {},
                            ),
                        );
                    }
                });
            });
        });
    },
    /**
     * Clears all data persisted by redux-persist (https://github.com/rt2zz/redux-persist)
     *
     * @method clear
     *
     * @returns {Promise}
     */
    clear() {
        return this.getKeys().then((keys) => {
            AsyncStorage.multiRemove(this._filterIrrelevantKeys(keys), (error) => {
                if (error) {
                    throw new Error(error);
                }
            });
        });
    },
};

/**
 * Checks if there is a newer version or if the current version is blacklisted
 * @param {object} store
 *
 * @returns {Promise<object>}
 *
 */
export const versionCheck = (store) => {
    const currentBuildNumber = get(store.getState(), 'settings.versions.buildNumber');
    return fetchVersions()
        .then(({ mobileBlacklist, latestMobile }) => {
            if (mobileBlacklist.includes(currentBuildNumber)) {
                store.dispatch(triggerForceUpdate());
            } else if (latestMobile > currentBuildNumber) {
                store.dispatch(triggerShouldUpdate());
            }
            return store;
        })
        .catch(() => store);
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
            // Purge and reinitialise persistent storage
            return reinitialiseStorage(getEncryptionKey).then(() => {
                store.dispatch(resetWallet());
                // Set the new app version
                store.dispatch(
                    setAppVersions({
                        version: getVersion(),
                        buildNumber: Number(getBuildNumber()),
                    }),
                );
            });
        }
    });
};
