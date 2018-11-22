import { ActionTypes } from '../actions/wallet';
import { ActionTypes as AlertsActionTypes } from '../actions/alerts';
import i18next from '../libs/i18next.js';

const networkMiddleware = (store) => (next) => (action) => {
    if (action.type === ActionTypes.CONNECTION_CHANGED && !action.payload.isConnected) {
        next({
            type: AlertsActionTypes.SHOW,
            category: 'error',
            title: i18next.t('global:noNetworkConnection'),
            message: i18next.t('global:noNetworkConnectionExplanation'),
            closeInterval: 3600000,
        });
        next(action);
    } else if (
        !store.getState().wallet.hasConnection &&
        action.type === ActionTypes.CONNECTION_CHANGED &&
        action.payload.isConnected
    ) {
        next(action);
        next({ type: AlertsActionTypes.HIDE });
    } else {
        next(action);
    }
};

export default networkMiddleware;
