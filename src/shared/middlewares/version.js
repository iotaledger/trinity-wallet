import { ActionTypes } from '../actions/wallet';
import { ActionTypes as AlertsActionTypes } from '../actions/alerts';
import i18next from '../libs/i18next.js';

const versionMiddleware = () => (next) => (action) => {
    if (action.type === ActionTypes.FORCE_UPDATE) {
        next({
            type: AlertsActionTypes.SHOW,
            category: 'error',
            title: i18next.t('global:forceUpdate'),
            message: i18next.t('global:forceUpdateExplanation'),
            closeInterval: 3600000,
        });
        next(action);
    } else if (action.type === ActionTypes.SHOULD_UPDATE) {
        next({
            type: AlertsActionTypes.SHOW,
            category: 'error',
            title: i18next.t('global:shouldUpdate'),
            message: i18next.t('global:shouldUpdateExplanation'),
            closeInterval: 3600000,
        });
        next(action);
    } else {
        next(action);
    }
};

export default versionMiddleware;
