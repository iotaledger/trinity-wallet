import i18next from '../i18next.js';

export const ActionTypes = {
    SHOW: 'IOTA/ALERTS/SHOW',
    HIDE: 'IOTA/ALERTS/HIDE',
};

const generate = (category, title, message, closeInterval = 5500) => ({
    type: ActionTypes.SHOW,
    category,
    title,
    message,
    closeInterval,
});

const dispose = () => ({ type: ActionTypes.HIDE });

export const generateAlert = (category, title, message, closeInterval) => dispatch =>
    dispatch(generate(category, title, message, closeInterval));

export const generateAccountInfoErrorAlert = () => dispatch =>
    dispatch(
        generateAlert(
            'error',
            i18next.t('global:invalidResponse'),
            i18next.t('global:invalidResponseFetchingAccount'),
            9000,
        ),
    );
export const generateSyncingCompleteAlert = () => dispatch => {
    dispatch(
        generateAlert(
            'success',
            i18next.t('settings:syncingComplete'),
            i18next.t('settings:syncingCompleteExplanation'),
            9000,
        ),
    );
};

export const generateAccountDeletedAlert = () => dispatch =>
    dispatch(
        generateAlert('success', i18next.t('settings:accountDeleted'), i18next.t('settings:accountDeletedExplanation')),
    );

export const generateInvalidResponseAlert = () => dispatch =>
    dispatch(
        generateAlert('success', i18next.t('settings:accountDeleted'), i18next.t('settings:accountDeletedExplanation')),
    );

export const disposeOffAlert = () => dispatch => dispatch(dispose());
