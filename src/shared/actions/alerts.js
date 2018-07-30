import i18next from '../i18next.js';
import Errors from '../libs/errors';

export const ActionTypes = {
    SHOW: 'IOTA/ALERTS/SHOW',
    HIDE: 'IOTA/ALERTS/HIDE',
    UPDATE_LOG: 'IOTA/ALERTS/UPDATE_LOG',
    CLEAR_LOG: 'IOTA/ALERTS/CLEAR_LOG',
};

/**
 * Dispatch to generate an alert
 *
 * @method generate
 * @param {string} category
 * @param {string} title
 * @param {string} message
 * @param {string} category
 * @param {number} closeInterval
 *
 * @returns {{ type: {string}, category: {string}, title: {string}, message: {string}, category: {string}, closeInterval: {number} }}
 */
const generate = (category, title, message, closeInterval = 5500) => ({
    type: ActionTypes.SHOW,
    category,
    title,
    message,
    closeInterval,
});

/**
 * Dispatch to hide an alert
 *
 * @method dispose
 *
 * @returns {{type: {string} }}
 */
const dispose = () => ({ type: ActionTypes.HIDE });

/**
 * Generates an alert. If an error string is passed then it also updates notification log in state
 *
 * @method generateAlert
 * @param {string} category
 * @param {string} title
 * @param {string} message
 * @param {string} category
 * @param {number} closeInterval
 * @param {object} err
 *
 * @returns {function} dispatch
 */
export const generateAlert = (category, title, message, closeInterval, err) => (dispatch) => {
    dispatch(generate(category, title, message, closeInterval));
    if (err) {
        dispatch(prepareLogUpdate(err));
    }
};

/**
 * Generates an error alert when an account info network call fails
 *
 * @method generateAccountInfoErrorAlert
 * @param {object} err
 *
 * @returns {function} dispatch
 */
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

/**
 * Generates an error alert if a network call is made to an out of sync node
 *
 * @method generateNodeOutOfSyncErrorAlert
 *
 * @returns {function} dispatch
 */
export const generateNodeOutOfSyncErrorAlert = () => (dispatch) => {
    dispatch(generateAlert('error', i18next.t('global:nodeOutOfSync'), i18next.t('global:nodeOutOfSyncExplanation')));
};

/**
 * Generates an error alert if something goes wrong during snapshot transition
 *
 * @method generateTransitionErrorAlert
 * @param {object} err
 *
 * @returns {function} dispatch
 */
export const generateTransitionErrorAlert = (err) => (dispatch) => {
    if (err.message.includes(Errors.ATTACH_TO_TANGLE_UNAVAILABLE)) {
        dispatch(
            generateAlert(
                'error',
                i18next.t('global:attachToTangleUnavailable'),
                i18next.t('global:attachToTangleUnavailableExplanation'),
                10000,
            ),
        );
    } else if (err.message.includes(Errors.CANNOT_TRANSITION_ADDRESSES_WITH_ZERO_BALANCE)) {
        dispatch(
            generateAlert(
                'error',
                i18next.t('snapshotTransition:cannotCompleteTransition'),
                i18next.t('snapshotTransition:cannotCompleteTransitionExplanation'),
                10000,
            ),
        );
    } else {
        dispatch(
            generateAlert(
                'error',
                i18next.t('snapshotTransition:cannotCompleteTransition'),
                i18next.t('snapshotTransition:somethingWentWrongTryAgain'),
                10000,
            ),
        );
    }
    dispatch(prepareLogUpdate(err));
};

/**
 * Generates a success alert if manual sync is completed
 *
 * @method generateSyncingCompleteAlert
 *
 * @returns {function} dispatch
 */
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

/**
 * Generates an alert when an account is succesfully deleted
 *
 * @method generateAccountDeletedAlert
 *
 * @returns {function} dispatch
 */
export const generateAccountDeletedAlert = () => (dispatch) =>
    dispatch(
        generateAlert('success', i18next.t('settings:accountDeleted'), i18next.t('settings:accountDeletedExplanation')),
    );

/**
 * Generates an error alert if something goes wrong during manual sync
 *
 * @method generateSyncingErrorAlert
 * @param {object} err
 *
 * @returns {function} dispatch
 */
export const generateSyncingErrorAlert = (err) => (dispatch) => {
    dispatch(
        generateAlert('error', i18next.t('settings:invalidResponse'), i18next.t('settings:invalidResponseExplanation')),
    );
    dispatch(prepareLogUpdate(err));
};

/**
 * Generates an error alert if something goes wrong during transaction
 *
 * @method generateTransferErrorAlert
 * @param {object} error
 *
 * @returns {function} dispatch
 */
export const generateTransferErrorAlert = (error) => (dispatch) =>
    dispatch(
        generateAlert(
            'error',
            i18next.t('global:transferError'),
            i18next.t('global:transferErrorMessage'),
            20000,
            error,
        ),
    );

/**
 * Generates an error alert if something goes wrong during transaction promotion
 *
 * @method generatePromotionErrorAlert
 * @param {object} error
 *
 * @returns {function} dispatch
 */
export const generatePromotionErrorAlert = (error) => (dispatch) =>
    dispatch(
        generateAlert(
            'error',
            i18next.t('global:promotionError'),
            i18next.t('global:promotionErrorExplanation'),
            20000,
            error,
        ),
    );

/**
 * Generates a success alert on successful transaction. Generates different alerts based on value/non-value transaction
 *
 * @method generateTransactionSuccessAlert
 * @param {boolean} isZeroValue
 *
 * @returns {function} dispatch
 */
export const generateTransactionSuccessAlert = (isZeroValue = false) => (dispatch) => {
    if (isZeroValue) {
        dispatch(
            generateAlert('success', i18next.t('global:messageSent'), i18next.t('global:messageSentMessage'), 20000),
        );
    } else {
        dispatch(
            generateAlert('success', i18next.t('global:transferSent'), i18next.t('global:transferSentMessage'), 20000),
        );
    }
};

/**
 * Hides an active alert
 *
 * @method disposeOffAlert
 *
 * @returns {function} dispatch
 */
export const disposeOffAlert = () => (dispatch) => dispatch(dispose());

/**
 * Formats error object, assigns error receive time and update notification logs with the newly received error
 *
 * @method prepareLogUpdate
 * @param {object} err
 *
 * @returns {function} dispatch
 */
export const prepareLogUpdate = (err) => (dispatch) => {
    const time = Date.now();
    const error = { error: err.toString(), time: time };
    dispatch(updateLog(error));
};

/**
 * Dispatch to update notification log in state
 *
 * @method updateLog
 * @param {object} logItem
 *
 * @returns {{type: {string}, logItem: {object} }}
 */
export const updateLog = (logItem) => ({
    type: ActionTypes.UPDATE_LOG,
    logItem,
});

/**
 * Dispatch to clear notification log in state
 *
 *
 * @method updateLog
 *
 * @returns {{type: {string} }}
 */
export const clearLog = () => ({
    type: ActionTypes.CLEAR_LOG,
});
