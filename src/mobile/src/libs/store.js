import get from 'lodash/get';
import { getVersion, getBuildNumber } from 'react-native-device-info';
import { AsyncStorage } from 'react-native';
import { doesSaltExistInKeychain } from 'libs/keychain';
import store, { persistStore, purgeStoredState, createPersistor } from '../../../shared/store';
import { setAppVersions, resetWallet } from '../../../shared/actions/settings';
import { shouldUpdate as triggerShouldUpdate, forceUpdate as triggerForceUpdate } from '../../../shared/actions/wallet';
import { updatePersistedState, fetchVersions } from '../../../shared/libs/utils';

export const persistConfig = {
    storage: AsyncStorage,
    blacklist: ['keychain', 'polling', 'ui', 'progress', 'deepLinks', 'wallet'],
};

const shouldMigrate = (restoredState) => {
    const restoredVersion = get(restoredState, 'settings.versions.version');
    const restoredBuildNumber = get(restoredState, 'settings.versions.buildNumber');

    const currentVersion = getVersion();
    const currentBuildNumber = getBuildNumber();

    return restoredVersion !== currentVersion || restoredBuildNumber !== currentBuildNumber;
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
            return purgeStoredState({ storage: persistConfig.storage }).then(() => {
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

export const migrate = (store, restoredState) => {
    const hasAnUpdate = shouldMigrate(restoredState);

    if (!hasAnUpdate) {
        store.dispatch(
            setAppVersions({
                version: getVersion(),
                buildNumber: getBuildNumber(),
            }),
        );
        return Promise.resolve(store);
    }
    return purgeStoredState({ storage: persistConfig.storage }).then(() => {
        store.dispatch(resetWallet());
        const propsToReset = [];

        // FIXME: Temporarily needed for node list reset
        if (get(restoredState, 'settings.versions.buildNumber') < 32) {
            propsToReset.push('settings.nodes');
        }

        // Set the new app version
        store.dispatch(
            setAppVersions({
                version: getVersion(),
                buildNumber: getBuildNumber(),
            }),
        );
        const persistor = createPersistor(store, persistConfig);
        const updatedState = updatePersistedState(store.getState(), restoredState, propsToReset);
        persistor.rehydrate(updatedState);
        return store;
    });
};

export const persistStoreAsync = () =>
    new Promise((resolve) =>
        persistStore(store, persistConfig, (err, restoredState) =>
            resolve({
                store,
                restoredState,
            }),
        ),
    );
