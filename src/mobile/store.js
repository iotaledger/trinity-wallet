import { AsyncStorage } from 'react-native';
import store, { persistState } from '../shared/store';

persistState(store, {
    storage: AsyncStorage,
    blacklist: ['iota'],
});

export default store;
