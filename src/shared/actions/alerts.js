import get from 'lodash/get';
import isString from 'lodash/isString';
import i18next from '../libs/i18next';
import Errors from '../libs/errors';
import { Wallet } from '../storage';
import { AlertsActionTypes } from '../types';

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
    type: AlertsActionTypes.SHOW,
    category,
    title,
    message,
    closeInterval,
});

/**
 * Dispatch to hide an alert
 *
 * @method dismiss
 *
 * @returns {{type: {string} }}
 */
const dismiss = () => ({ type: AlertsActionTypes.HIDE });

/**
 * Generates an alert. If an error string is passed then it also updates notification log in state
 *
 * @method generateAlert
 * @param {string} category
 * @param {string} title
 * @param {string} message
 * @param {string} category
 * @param {number} [closeInterval]
 * @param {object} [err]
 *
 * @returns {function} dispatch
 */
export const generateAlert = (category, title, message, closeInterval, err, timeout) => (dispatch) => {
    if (!timeout) {
        dispatch(generate(category, title, message, closeInterval));
    } else {
        setTimeout(() => dispatch(generate(category, title, message, closeInterval)), timeout);
    }
    if (err) {
        dispatch(prepareLogUpdate(err));
    }
};

/**
 * Generates relevant error alert
 *
 * @method generateErrorAlert
 * @param {func} generateDefaultAlert
 * @param {object} err
 *
 * @returns {function} dispatch
 */
export const generateErrorAlert = (generateDefaultAlert, err) => (dispatch) => {
    if (get(err, 'message') === Errors.LEDGER_CANCELLED) {
        dispatch(generateLedgerCancelledAlert(err));
    } else if (get(err, 'message') === Errors.LEDGER_INVALID_INDEX) {
        dispatch(generateLedgerIncorrectIndexAlert(err));
    } else if (get(err, 'message') === Errors.NODE_NOT_SYNCED) {
        dispatch(generateNodeOutOfSyncErrorAlert(err));
    } else if (get(err, 'message') === Errors.NODE_NOT_SYNCED_BY_TIMESTAMP) {
        dispatch(generateNodeOutOfSyncErrorAlert(err, true));
    } else if (get(err, 'message') === Errors.UNSUPPORTED_NODE) {
        dispatch(generateUnsupportedNodeErrorAlert(err));
    } else if (get(err, 'message') === Errors.NOT_ENOUGH_SYNCED_NODES) {
        dispatch(generateNotEnoughSyncedNodes(err));
    } else {
        dispatch(generateDefaultAlert(err));
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
export const generateNodeOutOfSyncErrorAlert = (err, byTimestamp = false) => (dispatch) => {
    dispatch(
        generateAlert(
            'error',
            i18next.t('global:nodeOutOfSync'),
            byTimestamp
                ? i18next.t('global:nodeOutOfSyncByTimestampExplanation')
                : i18next.t('global:nodeOutOfSyncExplanation'),
            9000,
            err,
        ),
    );
};

/**
 * Generates an error alert if a network call is made to an unsupported node
 *
 * @method generateUnsupportedNodeErrorAlert
 *
 * @returns {function} dispatch
 */
export const generateUnsupportedNodeErrorAlert = (err) => (dispatch) => {
    dispatch(
        generateAlert(
            'error',
            i18next.t('global:experimentalNode'),
            i18next.t('global:experimentalNodeExplanation'),
            10000,
            err,
        ),
    );
};

/**
 * Generates an error alert if there are insufficient synced nodes for quorum
 *
 * @method generateNotEnoughSyncedNodes
 *
 * @returns {function} dispatch
 */
export const generateNotEnoughSyncedNodes = (err) => (dispatch) => {
    dispatch(
        generateAlert(
            'error',
            i18next.t('global:notEnoughSyncedNodes'),
            i18next.t('global:notEnoughSyncedNodesExplanation'),
            10000,
            err,
        ),
    );
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
    if (typeof err.message === 'string' && err.message.includes(Errors.ATTACH_TO_TANGLE_UNAVAILABLE)) {
        dispatch(
            generateAlert(
                'error',
                i18next.t('global:attachToTangleUnavailable'),
                i18next.t('global:attachToTangleUnavailableExplanation'),
                10000,
                err,
            ),
        );
    } else if (
        typeof err.message === 'string' &&
        err.message.includes(Errors.CANNOT_TRANSITION_ADDRESSES_WITH_ZERO_BALANCE)
    ) {
        dispatch(
            generateAlert(
                'error',
                i18next.t('snapshotTransition:cannotCompleteTransition'),
                i18next.t('snapshotTransition:cannotCompleteTransitionExplanation'),
                10000,
                err,
            ),
        );
    } else {
        dispatch(
            generateAlert(
                'error',
                i18next.t('snapshotTransition:cannotCompleteTransition'),
                i18next.t('snapshotTransition:somethingWentWrongTryAgain'),
                10000,
                err,
            ),
        );
    }
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
 * Generates an alert when an account is successfully deleted
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
        generateAlert(
            'error',
            i18next.t('settings:invalidResponse'),
            i18next.t('settings:invalidResponseExplanation'),
            20000,
            err,
        ),
    );
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
            undefined,
            error,
        ),
    );

/**
 * Generates an info alert (if account syncing fails) for auto retrying account sync
 *
 * @method generateAccountSyncRetryAlert
 *
 * @returns {function} dispatch
 */
export const generateAccountSyncRetryAlert = () => (dispatch) =>
    dispatch(
        generateAlert(
            'info',
            i18next.t('global:pleaseWait'),
            `${i18next.t('global:errorFetchingAccountInformation')} ${i18next.t(
                'global:tryingAgainWithDifferentNode',
            )}`,
            20000,
        ),
    );

/**
 * Generates an info alert (if addresses syncing fails) for auto retrying addresses sync
 *
 * @method generateAddressesSyncRetryAlert
 *
 * @returns {function} dispatch
 */
export const generateAddressesSyncRetryAlert = () => (dispatch) =>
    dispatch(generateAlert('info', i18next.t('global:pleaseWait'), i18next.t('global:errorSyncingAddresses'), 20000));

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
 * Generates an error for user cancelled Ledger request
 *
 * @method generateLedgerCancelledAlert
 * @param {object} err
 *
 * @returns {function} dispatch
 */
export const generateLedgerCancelledAlert = (err) => (dispatch) => {
    dispatch(
        generateAlert(
            'error',
            i18next.t('ledger:actionCancelled'),
            i18next.t('ledger:actionCancelledExplanation'),
            10000,
            err,
        ),
    );
};

/**
 * Generates an error for incorrect ledger
 *
 * @method generateLedgerIncorrectIndexAlert
 * @param {object} err
 *
 * @returns {function} dispatch
 */
export const generateLedgerIncorrectIndexAlert = (err) => (dispatch) => {
    dispatch(
        generateAlert(
            'error',
            i18next.t('ledger:ledgerIncorrectIndex'),
            i18next.t('ledger:ledgerIncorrectIndexExplanation'),
            15000,
            err,
        ),
    );
};

/**
 * Hides an active alert
 *
 * @method dismissAlert
 *
 * @returns {function} dispatch
 */
export const dismissAlert = () => (dispatch) => dispatch(dismiss());

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

    const error = {
        error: err instanceof Error && isString(err.message) ? err.message : err.toString(),
        time: time,
    };

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
export const updateLog = (logItem) => {
    Wallet.updateErrorLog(logItem);

    return {
        type: AlertsActionTypes.UPDATE_LOG,
        logItem,
    };
};

/**
 * Dispatch to clear notification log in state
 *
 *
 * @method clearLog
 *
 * @returns {{type: {string} }}
 */
export const clearLog = () => {
    Wallet.clearErrorLog();

    return {
        type: AlertsActionTypes.CLEAR_LOG,
    };
};
