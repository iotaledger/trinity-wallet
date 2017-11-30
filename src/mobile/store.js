import { AsyncStorage } from 'react-native';
import store, { persistState } from '../shared/store';

export const persistor = persistState(store, {
    storage: AsyncStorage,
    blacklist: ['tempAccount'],
});

export default store;
