import { WalletActionTypes, AlertsActionTypes } from '../types';
import i18next from '../libs/i18next';

const versionMiddleware = () => (next) => (action) => {
    if (action.type === WalletActionTypes.FORCE_UPDATE) {
        next({
            type: AlertsActionTypes.SHOW,
            category: 'error',
            title: i18next.t('global:forceUpdate'),
            message: i18next.t('global:forceUpdateExplanation'),
            closeInterval: 3600000,
        });
        next(action);
    } else if (action.type === WalletActionTypes.SHOULD_UPDATE) {
        /*next({
            type: AlertsActionTypes.SHOW,
            category: 'error',
            title: i18next.t('global:shouldUpdate'),
            message: i18next.t('global:shouldUpdateExplanation'),
            closeInterval: 3600000,
        });
        next(action);*/
    } else {
        next(action);
    }
};

export default versionMiddleware;
