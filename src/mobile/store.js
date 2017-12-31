import { AsyncStorage } from 'react-native';
import store, { persistState } from 'iota-wallet-shared-modules/store';

export const persistor = persistState(store, {
    storage: AsyncStorage,
    blacklist: ['tempAccount', 'keychain'],
});

export default store;
