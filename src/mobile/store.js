import { getVersion, getBuildNumber } from 'react-native-device-info';
import { AsyncStorage } from 'react-native';
import store, { persistState } from '../shared/store';
import initializeApp from './routes/entry';

export const persistor = persistState(
    store,
    {
        storage: AsyncStorage,
        blacklist: ['alerts', 'tempAccount', 'keychain', 'polling', 'ui'],
    },
    {
        android: {
            version: getVersion(),
            buildNumber: getBuildNumber(),
        },
        ios: {
            version: getVersion(),
            buildNumber: getBuildNumber(),
        },
    },
    persistedState => initializeApp(persistedState),
);
