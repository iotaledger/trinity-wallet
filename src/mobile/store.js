import { persistStore } from 'redux-persist';
import { AsyncStorage } from 'react-native';
import store from '../shared/store';

persistStore(store, {
    storage: AsyncStorage, 
    blacklist: ['iota'] 
});

export default store;
