import { WalletActionTypes, AlertsActionTypes } from '../types';
import i18next from '../libs/i18next';

const versionMiddleware = () => (next) => (action) => {
    if (action.type === WalletActionTypes.DEPRECATE) {
        next({
            type: AlertsActionTypes.SHOW,
            category: 'error',
            title: i18next.t('global:deprecationWarning'),
            message: i18next.t('global:deprecationWarningExplanation'),
            closeInterval: 3600000,
        });
        next(action);
    } else if (action.type === WalletActionTypes.FORCE_UPDATE) {
        next({
            type: AlertsActionTypes.SHOW,
            category: 'error',
            title: i18next.t('global:forceUpdate'),
            message: i18next.t('global:forceUpdateExplanation'),
            closeInterval: 3600000,
        });
        next(action);
    } else if (action.type === WalletActionTypes.SHOULD_UPDATE) {
        next({
            type: AlertsActionTypes.SHOW,
            category: 'error',
            title: i18next.t('global:shouldUpdate'),
            message: i18next.t('global:shouldUpdateExplanation'),
            closeInterval: 3600000,
        });
        next(action);
    } else if (action.type === WalletActionTypes.CHRYSALIS_MIGRATION) {
            next({
                type: AlertsActionTypes.SHOW,
                category: 'error',
                title: i18next.t('global:chrysalisMigrationWarning'),
                message: i18next.t('global:chrysalisMigrationWarningExplanation'),
                closeInterval: 3600000,
            });
            next(action);
    } else if (action.type === WalletActionTypes.DISPLAY_SEED_MIGRATION_ALERT) {
        next({
            type: AlertsActionTypes.SHOW,
            category: 'error',
            title: 'CRITICAL SECURITY ALERT',
            message: `It is strongly recommended that you migrate your seeds. Visit ${action.payload} for more information.`,
            closeInterval: 3600000,
        });
        next(action);
    } else {
        next(action);
    }
};

export default versionMiddleware;
