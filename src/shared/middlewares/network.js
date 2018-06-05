import { ActionTypes } from '../actions/wallet';
import { ActionTypes as AlertsActionTypes } from '../actions/alerts';
import i18next from '../i18next.js';

/* eslint-disable no-unused-vars */
const networkMiddleware = (store) => (next) => (action) => {
    /* eslint-enable no-unused-vars */

    if (action.type === ActionTypes.CONNECTION_CHANGED && !action.payload.isConnected) {
        const { isClockSynced } = action.payload;

        next({
            type: AlertsActionTypes.SHOW,
            category: 'error',
            title: i18next.t(!isClockSynced ? 'global:clockOutOfSync' : 'global:noNetworkConnection'),
            message: i18next.t(
                !isClockSynced ? 'global:clockOutOfSyncExplanation' : 'global:noNetworkConnectionExplanation',
            ),
            closeInterval: 3600000,
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
