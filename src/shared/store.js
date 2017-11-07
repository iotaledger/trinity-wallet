import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { autoRehydrate, persistStore } from 'redux-persist';
import thunk from 'redux-thunk';
import marketData from './reducers/marketData';
import tempAccount from './reducers/tempAccount';
import account, * as fromAccount from './reducers/account';
import app from './reducers/app';
import settings from './reducers/settings';
import seeds from './reducers/seeds';
import notifications from './reducers/notifications';
import alerts from './reducers/alerts';
import home from './reducers/home';

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
});

const rootReducer = (state, action) => {
    /* eslint-disable no-param-reassign */
    // FIXME: For some reason cannot resolve path to shared/actions/app/ActionTypes
    // Should rather be using LOGOUT type imported from actions

    if (action.type === 'IOTA/APP/WALLET/LOGOUT' || action.type === 'IOTA/APP/WALLET/RESET') {
        state = undefined;
    }
    /* eslint-enable no-param-reassign */
    return reducers(state, action);
};

const store = createStore(
    rootReducer,
    compose(
        applyMiddleware(thunk),
        autoRehydrate(),
        typeof window !== 'undefined' && window.devToolsExtension ? window.devToolsExtension() : f => f,
    ),
);

export const getTailTransactionHashesForPendingTransactions = state => {
    return fromAccount.getTailTransactionHashesForPendingTransactions(
        state.account.transfers,
        state.account.accountInfo,
        state.tempAccount.seedIndex,
    );
};

export const persistState = (state, config) => persistStore(state, config);

export default store;
