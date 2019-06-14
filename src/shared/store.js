/* global Electron */
import assign from 'lodash/assign';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
/* eslint-disable no-unused-vars */
import logger from 'redux-logger';
/* eslint-enable no-unused-vars */
import thunk from 'redux-thunk';
import marketData from './reducers/marketData';
import wallet from './reducers/wallet';
import accounts from './reducers/accounts';
import settings from './reducers/settings';
import alerts from './reducers/alerts';
import home from './reducers/home';
import keychain from './reducers/keychain';
import polling from './reducers/polling';
import progress from './reducers/progress';
import ui from './reducers/ui';
import { SettingsActionTypes, WalletActionTypes } from './types';
import networkMiddleware from './middlewares/network';
import versionMiddleware from './middlewares/version';
import alertsMiddleware from './middlewares/alerts';
import modalMiddleware from './middlewares/modal';
import { getEncryptionKey } from '../desktop/src/libs/realm';
import { encrypt } from '../desktop/src/libs/crypto';
import { __DEV__, __MOBILE__ } from './config';

const developmentMiddleware = [thunk, networkMiddleware, versionMiddleware, alertsMiddleware, modalMiddleware];
const productionMiddleware = [thunk, networkMiddleware, versionMiddleware, alertsMiddleware, modalMiddleware];

if (__MOBILE__) {
    /* developmentMiddleware.unshift(logger); */
}

const reducers = combineReducers({
    alerts,
    marketData,
    accounts,
    settings,
    home,
    keychain,
    polling,
    progress,
    ui,
    wallet,
});

const rootReducer = (state, action) => {
    /* eslint-disable no-param-reassign */
    if (action.type === SettingsActionTypes.WALLET_RESET) {
        state = undefined;
    }

    if (action.type === WalletActionTypes.MAP_STORAGE_TO_STATE) {
        return reducers(assign({}, state, action.payload), action);
    }

    return reducers(state, action);
};

const middleware = __DEV__ ? developmentMiddleware : productionMiddleware;

let bounceTimeout = null;

const storeLocalStorage = (store) => (next) => (action) => {
    const { accounts, alerts, settings } = store.getState();

    if (bounceTimeout) {
        clearTimeout(bounceTimeout);
    }

    bounceTimeout = setTimeout(async () => {
        const key = await getEncryptionKey();
        const cypherText = await encrypt(JSON.stringify({ accounts, alerts, settings }), key);
        Electron.setStorage('__STATE__', cypherText);
    }, 500);

    next(action);
};

const store = createStore(
    rootReducer,
    compose(
        applyMiddleware(...middleware, storeLocalStorage),
        typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__
            ? window.__REDUX_DEVTOOLS_EXTENSION__()
            : (f) => f,
    ),
);

export default store;
