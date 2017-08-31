import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { persistStore, autoRehydrate } from 'redux-persist';
import { AsyncStorage } from 'react-native';

import thunk from 'redux-thunk';

import marketData from './reducers/marketDataReducer';
import iota from './reducers/iotaReducer';
import account from './reducers/accountReducer';


export default store = createStore(

  combineReducers({
    marketData,
    iota,
    account,
  }),
    compose(
        applyMiddleware(thunk),
        autoRehydrate(),
    ),


);
persistStore(store, { storage: AsyncStorage }, () => {
  console.log('restored');
});

{/*, blacklist: ['iota']*/}
