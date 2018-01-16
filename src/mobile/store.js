import get from 'lodash/get';
import { getVersion, getBuildNumber } from 'react-native-device-info';
import store, { persistStore, getStoredState, purgeStoredState, createPersistor } from '../shared/store';
import initializeApp from './routes/entry';
import { AsyncStorage } from 'react-native';
import { setAppVersions, resetWallet } from '../shared/actions/app';
import { updatePersistedState } from '../shared/libs/util';

export const persistConfig = {
    storage: AsyncStorage,
    blacklist: ['alerts', 'tempAccount', 'keychain', 'polling', 'ui'],
};

const shouldMigrate = (freshState, restoredState) => {
    const restoredVersion = get(restoredState, 'app.versions.version');
    const restoredBuildNumber = get(restoredState, 'app.versions.buildNumber');

    const currentVersion = getVersion();
    const currentBuildNumber = getBuildNumber();

    return restoredVersion !== currentVersion || restoredBuildNumber !== currentBuildNumber;
};

const migrate = (state, restoredState) => {
    const hasAnUpdate = shouldMigrate(state.getState(), restoredState);

    if (!hasAnUpdate) {
        state.dispatch(
            setAppVersions({
                version: '14',
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
                    version: '14',
                    buildNumber: getBuildNumber(),
                }),
            );

            const persistor = createPersistor(state, persistConfig);
            const updatedState = updatePersistedState(state.getState(), restoredState);
            persistor.rehydrate(updatedState);

            return initializeApp(state);
        })
        .catch(() => initializeApp(state));
};

export const persistor = persistStore(store, persistConfig, (err, restoredState) => migrate(store, restoredState));
