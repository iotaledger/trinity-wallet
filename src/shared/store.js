import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { autoRehydrate } from 'redux-persist';
import thunk from 'redux-thunk';

import marketData from './reducers/marketDataReducer';
import iota from './reducers/iotaReducer';
import account from './reducers/accountReducer';

const store = createStore(
  combineReducers({
    marketData,
    iota,
    account,
  }),
  compose(
    applyMiddleware(thunk),
    autoRehydrate(),
    typeof window !== 'undefined' && window.devToolsExtension
        ? window.devToolsExtension()
        : (f) => f
  ),
);

export default store;
