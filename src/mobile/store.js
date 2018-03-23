import get from 'lodash/get';
import { getVersion, getBuildNumber } from 'react-native-device-info';
import { AsyncStorage } from 'react-native';
import store, { persistStore, purgeStoredState, createPersistor } from '../shared/store';
import initializeApp from './routes/entry';
import { setAppVersions, resetWallet } from '../shared/actions/app';
import { updatePersistedState } from '../shared/libs/utils';

export const persistConfig = {
    storage: AsyncStorage,
    blacklist: ['app', 'keychain', 'polling', 'ui', 'progress', 'seeds'],
};

const shouldMigrate = (restoredState) => {
    const restoredVersion = get(restoredState, 'app.versions.version');
    const restoredBuildNumber = get(restoredState, 'app.versions.buildNumber');

    const currentVersion = getVersion();
    const currentBuildNumber = getBuildNumber();

    return restoredVersion !== currentVersion || restoredBuildNumber !== currentBuildNumber;
};

const migrate = (state, restoredState) => {
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

    return purgeStoredState({ storage: persistConfig.storage })
        .then(() => {
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
        })
        .catch((err) => console.error(err)); // eslint-disable-line no-console
};

export const persistor = persistStore(store, persistConfig, (err, restoredState) => migrate(store, restoredState));
