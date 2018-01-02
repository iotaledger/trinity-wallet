import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { autoRehydrate, persistStore } from 'redux-persist';
import thunk from 'redux-thunk';
import logger from 'redux-logger';

import marketData from './reducers/marketData';
import tempAccount from './reducers/tempAccount';
import account from './reducers/account';
import app from './reducers/app';
import settings from './reducers/settings';
import seeds from './reducers/seeds';
import notifications from './reducers/notifications';
import alerts from './reducers/alerts';
import home from './reducers/home';
import keychain from './reducers/keychain';
import polling from './reducers/polling';
import { ActionTypes } from './actions/app';

const reducers = combineReducers({
    alerts,
    marketData,
    tempAccount,
    account,
    app,
    settings,
    seeds,
    notifications,
    home,
    keychain,
    polling,
});

const rootReducer = (state, action) => {
    if (action.type === ActionTypes.WALLET_RESET) {
        state = undefined;
    }
    /* eslint-enable no-param-reassign */
    return reducers(state, action);
};

const store = createStore(
    rootReducer,
    compose(
        applyMiddleware(thunk, logger),
        autoRehydrate(),
        typeof window !== 'undefined' && window.devToolsExtension ? window.devToolsExtension() : f => f,
    ),
);

export const persistState = (state, config) => persistStore(state, config);

export default store;
