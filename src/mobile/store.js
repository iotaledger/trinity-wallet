import { AsyncStorage } from 'react-native';
import store, { persistState } from '../shared/store';
import initializeApp from './routes/entry';

export const persistor = persistState(
    store,
    {
        storage: AsyncStorage,
        blacklist: ['tempAccount', 'keychain', 'polling', 'ui'],
    },
    persistedState => initializeApp(persistedState),
);
