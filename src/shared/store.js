import assign from 'lodash/assign';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
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
import { ActionTypes } from './actions/settings';
import { ActionTypes as WalletActionTypes } from './actions/wallet';
import networkMiddleware from './middlewares/network';
import versionMiddleware from './middlewares/version';
import alertsMiddleware from './middlewares/alerts';
import modalMiddleware from './middlewares/modal';
import { __DEV__ } from './config';

const developmentMiddleware = [thunk, networkMiddleware, versionMiddleware, alertsMiddleware, modalMiddleware];
const productionMiddleware = [thunk, networkMiddleware, versionMiddleware, alertsMiddleware, modalMiddleware];

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
    if (action.type === ActionTypes.WALLET_RESET) {
        state = undefined;
    }

    if (action.type === WalletActionTypes.MAP_STORAGE_TO_STATE) {
        return reducers(assign({}, state, action.payload), action);
    }

    return reducers(state, action);
};

const middleware = __DEV__ ? developmentMiddleware : productionMiddleware;

const store = createStore(
    rootReducer,
    compose(
        applyMiddleware(...middleware),
        typeof window !== 'undefined' && window.devToolsExtension ? window.devToolsExtension() : (f) => f,
    ),
);

export default store;
