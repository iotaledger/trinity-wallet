import get from 'lodash/get';
import { getVersion, getBuildNumber } from 'react-native-device-info';
import store, { persistStore, getStoredState, purgeStoredState, createPersistor } from '../shared/store';
import initializeApp from './routes/entry';
import { AsyncStorage } from 'react-native';
import { setAppVersions } from '../shared/actions/app';
import { updatePersistedState } from '../shared/libs/util';

const persistConfig = {
    storage: AsyncStorage,
    blacklist: ['alerts', 'tempAccount', 'keychain', 'polling', 'ui'],
};

const shouldMigrate = (freshState, restoredState) => {
    const restoredVersion = get(restoredState, 'app.versions.version');
    const restoredBuildNumber = get(restoredState, 'app.versions.buildNumber');

    const incomingVersion = get(freshState, 'app.versions.version');
    const incomingBuildNumber = get(freshState, 'app.versions.buildNumber');
    return restoredVersion !== incomingVersion || restoredBuildNumber !== incomingBuildNumber;
};

const migrate = async state => {
    state.dispatch(
        setAppVersions({
            version: '14',
            buildNumber: getBuildNumber(),
        }),
    );

    const restoredState = await getStoredState(persistConfig);
    const hasAnUpdate = shouldMigrate(state.getState(), restoredState);

    if (!hasAnUpdate) {
        console.log('Not  has an update');
        return persistStore(state, persistConfig, () => initializeApp(state));
    }

    console.log('Has an update');
    const persistor = createPersistor(state, persistConfig);
    await purgeStoredState({ storage: persistConfig.storage });

    const updatedState = updatePersistedState(state.getState(), restoredState, persistConfig.blacklist);
    persistor.rehydrate(updatedState);
    initializeApp(state);

    return persistor;
};

export const persistor = migrate(store);
