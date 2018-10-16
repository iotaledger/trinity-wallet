import get from 'lodash/get';
import { getVersion, getBuildNumber } from 'react-native-device-info';
import { AsyncStorage } from 'react-native';
import { doesSaltExistInKeychain } from 'libs/keychain';
import store, { persistStore, purgeStoredState, createPersistor } from '../../../shared/store';
import { setAppVersions, resetWallet } from '../../../shared/actions/settings';
import { updatePersistedState } from '../../../shared/libs/utils';

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
    // TODO: Doing a dirty patch to disable migration setup for alpha v0.2.0
    // since this would be installed as a fresh application.
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
        // Set the new app version
        store.dispatch(
            setAppVersions({
                version: getVersion(),
                buildNumber: getBuildNumber(),
            }),
        );

        const persistor = createPersistor(store, persistConfig);
        const updatedState = updatePersistedState(store.getState(), restoredState);
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
