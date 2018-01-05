import i18next from 'i18next';

export const ActionTypes = {
    SHOW: 'IOTA/ALERTS/SHOW',
    HIDE: 'IOTA/ALERTS/HIDE',
};

const generate = (category, title, message) => ({
    type: ActionTypes.SHOW,
    category,
    title,
    message,
});

const dispose = () => ({ type: ActionTypes.HIDE });

export const generateAlert = (category, title, message) => dispatch => dispatch(generate(category, title, message));

export const generateAccountInfoErrorAlert = () => dispatch =>
    dispatch(
        generateAlert(
            'error',
            i18next.t('global:invalidResponse'),
            i18next.t('global:invalidResponseFetchingAccount'), // Or could just say communicating with your selected IOTA node.
        ),
    );
export const generateSyncingSuccessAlert = () => dispatch => {
    dispatch(
        generateAlert(
            'success',
            i18next.t('settings:syncingComplete'),
            i18next.t('settings:syncingCompleteExplanation'),
        ),
    );
};

export const disposeOffAlert = () => dispatch => dispatch(dispose());
