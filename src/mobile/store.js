import { AsyncStorage } from 'react-native';
import store, { persistState } from '../shared/store';

persistState(store, {
    storage: AsyncStorage,
    blacklist: ['tempAccount'],
});

export default store;
