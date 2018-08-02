import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { autoRehydrate, persistStore, getStoredState, purgeStoredState, createPersistor } from 'redux-persist';
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
import networkMiddleware from './middlewares/network';
import alertsMiddleware from './middlewares/alerts';
import modalMiddleware from './middlewares/modal';

const isDevelopment = process.env.NODE_ENV === 'development';

const developmentMiddleware = [thunk, networkMiddleware, alertsMiddleware, modalMiddleware];
const productionMiddleware = [thunk, networkMiddleware, alertsMiddleware, modalMiddleware];

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
    if (action.type === ActionTypes.WALLET_RESET) {
        state = undefined;
    }

    /* eslint-enable no-param-reassign */
    return reducers(state, action);
};

const middleware = isDevelopment ? developmentMiddleware : productionMiddleware;

const store = createStore(
    rootReducer,
    compose(
        applyMiddleware(...middleware),
        autoRehydrate(),
        typeof window !== 'undefined' && window.devToolsExtension ? window.devToolsExtension() : (f) => f,
    ),
);

export { persistStore, getStoredState, purgeStoredState, createPersistor };

export default store;
