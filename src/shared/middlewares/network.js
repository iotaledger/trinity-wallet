import { ActionTypes } from '../actions/wallet';
import { ActionTypes as AlertsActionTypes } from '../actions/alerts';
import i18next from '../i18next.js';

/* eslint-disable no-unused-vars */
const networkMiddleware = (store) => (next) => (action) => {
/* eslint-enable no-unused-vars */

    if (action.type === ActionTypes.CONNECTION_CHANGED && !action.payload.isConnected) {
        next({
            type: AlertsActionTypes.SHOW,
            category: 'error',
            title: i18next.t('global:noNetworkConnection'),
            message: i18next.t('global:noNetworkConnectionExplanation'),
            closeInterval: 100000,
        });

        next(action);
    } else if (action.type === ActionTypes.CONNECTION_CHANGED && action.payload.isConnected) {
        next(action);
        next({ type: AlertsActionTypes.HIDE });
    } else {
        next(action);
    }
};

export default networkMiddleware;
