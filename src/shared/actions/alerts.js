import i18next from '../i18next.js';

export const ActionTypes = {
    SHOW: 'IOTA/ALERTS/SHOW',
    HIDE: 'IOTA/ALERTS/HIDE',
    UPDATE_LOG: 'IOTA/ALERTS/UPDATE_LOG',
    CLEAR_LOG: 'IOTA/ALERTS/CLEAR_LOG',
};

const generate = (category, title, message, closeInterval = 5500) => ({
    type: ActionTypes.SHOW,
    category,
    title,
    message,
    closeInterval,
});

const dispose = () => ({ type: ActionTypes.HIDE });

export const generateAlert = (category, title, message, closeInterval, err) => (dispatch) => {
    dispatch(generate(category, title, message, closeInterval));
    if (err) {
        dispatch(prepareLogUpdate(err));
    }
};

export const generateAccountInfoErrorAlert = (err) => (dispatch) => {
    dispatch(
        generateAlert(
            'error',
            i18next.t('global:invalidResponse'),
            i18next.t('global:invalidResponseFetchingAccount'),
            9000,
        ),
    );
    dispatch(prepareLogUpdate(err));
};

export const generateTransitionErrorAlert = () => (dispatch) => {
    dispatch(generateAlert('error', 'Snapshot transition failed', 'Please try again.', 10000));
};

export const generateSyncingCompleteAlert = () => (dispatch) => {
    dispatch(
        generateAlert(
            'success',
            i18next.t('settings:syncingComplete'),
            i18next.t('settings:syncingCompleteExplanation'),
            9000,
        ),
    );
};

export const generateAccountDeletedAlert = () => (dispatch) =>
    dispatch(
        generateAlert('success', i18next.t('settings:accountDeleted'), i18next.t('settings:accountDeletedExplanation')),
    );

export const generateSyncingErrorAlert = (err) => (dispatch) => {
    dispatch(
        generateAlert('error', i18next.t('settings:invalidResponse'), i18next.t('settings:invalidResponseExplanation')),
    );
    dispatch(prepareLogUpdate(err));
};

export const disposeOffAlert = () => (dispatch) => dispatch(dispose());

export const prepareLogUpdate = (err) => (dispatch) => {
    const time = Date.now();
    const error = { error: err.toString(), time: time };
    dispatch(updateLog(error));
};

export const updateLog = (logItem) => ({
    type: ActionTypes.UPDATE_LOG,
    logItem,
});

export const clearLog = () => ({
    type: ActionTypes.CLEAR_LOG,
});
