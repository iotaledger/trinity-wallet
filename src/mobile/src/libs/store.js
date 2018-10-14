import get from 'lodash/get';
import { getVersion, getBuildNumber } from 'react-native-device-info';
import { AsyncStorage } from 'react-native';
import { doesSaltExistInKeychain } from 'libs/keychain';
import store, { persistStore, purgeStoredState, createPersistor } from '../../../shared/store';
import initializeApp from '../ui/routes/entry';
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
 * @param {object} state
 */
const resetIfKeychainIsEmpty = (state) => {
    doesSaltExistInKeychain().then((exists) => {
        if (!exists) {
            purgeStoredState({ storage: persistConfig.storage }).then(() => {
                state.dispatch(resetWallet());
                // Set the new app version
                state.dispatch(
                    setAppVersions({
                        version: getVersion(),
                        buildNumber: getBuildNumber(),
                    }),
                );
                return initializeApp(state);
            });
        }
    });
};

const migrate = (state, restoredState) => {
    return state.getState().accounts.onboardingComplete
        ? resetIfKeychainIsEmpty(state)
        : Promise.resolve()
              .then(() => {
                  // TODO: Doing a dirty patch to disable migration setup for alpha v0.2.0
                  // since this would be installed as a fresh application.
                  const hasAnUpdate = shouldMigrate(restoredState);

                  if (!hasAnUpdate) {
                      state.dispatch(
                          setAppVersions({
                              version: getVersion(),
                              buildNumber: getBuildNumber(),
                          }),
                      );

                      return initializeApp(state);
                  }

                  return purgeStoredState({ storage: persistConfig.storage }).then(() => {
                      state.dispatch(resetWallet());
                      // Set the new app version
                      state.dispatch(
                          setAppVersions({
                              version: getVersion(),
                              buildNumber: getBuildNumber(),
                          }),
                      );

                      const persistor = createPersistor(state, persistConfig);
                      const updatedState = updatePersistedState(state.getState(), restoredState);
                      persistor.rehydrate(updatedState);

                      return initializeApp(state);
                  });
              })
              .catch((err) => console.error(err)); // eslint-disable-line no-console
};

export const persistor = persistStore(store, persistConfig, (err, restoredState) => migrate(store, restoredState));
