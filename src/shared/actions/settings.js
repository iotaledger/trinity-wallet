import get from 'lodash/get';
import keys from 'lodash/keys';
import map from 'lodash/map';
import { changeIotaNode } from '../libs/iota/index';
import i18next from '../libs/i18next';
import { generateAlert, generateNodeOutOfSyncErrorAlert, generateUnsupportedNodeErrorAlert } from '../actions/alerts';
import { fetchNodeList } from '../actions/polling';
import { allowsRemotePow } from '../libs/iota/extendedApi';
import { getSelectedNodeFromState } from '../selectors/global';
import { throwIfNodeNotHealthy } from '../libs/iota/utils';
import Errors from '../libs/errors';
import { Wallet, Node } from '../storage';

export const ActionTypes = {
    SET_LOCALE: 'IOTA/SETTINGS/LOCALE',
    SET_NODE: 'IOTA/SETTINGS/FULLNODE',
    SET_NODE_REQUEST: 'IOTA/SETTINGS/SET_NODE_REQUEST',
    SET_NODE_ERROR: 'IOTA/SETTINGS/SET_NODE_ERROR',
    ADD_CUSTOM_NODE_REQUEST: 'IOTA/SETTINGS/ADD_CUSTOM_NODE_REQUEST',
    ADD_CUSTOM_NODE_SUCCESS: 'IOTA/SETTINGS/ADD_CUSTOM_NODE_SUCCESS',
    ADD_CUSTOM_NODE_ERROR: 'IOTA/SETTINGS/ADD_CUSTOM_NODE_ERROR',
    REMOVE_CUSTOM_NODE: 'IOTA/SETTINGS/REMOVE_CUSTOM_NODE',
    SET_MODE: 'IOTA/SETTINGS/SET_MODE',
    SET_THEME: 'IOTA/SETTINGS/SET_THEME',
    SET_LANGUAGE: 'IOTA/SETTINGS/SET_LANGUAGE',
    SET_CURRENCY_DATA: 'IOTA/SETTINGS/SET_CURRENCY',
    UPDATE_THEME: 'IOTA/SETTINGS/UPDATE_THEME',
    CURRENCY_DATA_FETCH_REQUEST: 'IOTA/SETTINGS/CURRENCY_DATA_FETCH_REQUEST',
    CURRENCY_DATA_FETCH_SUCCESS: 'IOTA/SETTINGS/CURRENCY_DATA_FETCH_SUCCESS',
    CURRENCY_DATA_FETCH_ERROR: 'IOTA/SETTINGS/CURRENCY_DATA_FETCH_ERROR',
    SET_RANDOMLY_SELECTED_NODE: 'IOTA/SETTINGS/SET_RANDOMLY_SELECTED_NODE',
    SET_NODELIST: 'IOTA/SETTINGS/SET_NODELIST',
    SET_REMOTE_POW: 'IOTA/SETTINGS/SET_REMOTE_POW',
    SET_AUTO_PROMOTION: 'IOTA/SETTINGS/SET_AUTO_PROMOTION',
    UPDATE_AUTO_NODE_SWITCHING: 'IOTA/SETTINGS/UPDATE_AUTO_NODE_SWITCHING',
    SET_LOCK_SCREEN_TIMEOUT: 'IOTA/SETTINGS/SET_LOCK_SCREEN_TIMEOUT',
    SET_VERSIONS: 'IOTA/SETTINGS/WALLET/SET_VERSIONS',
    WALLET_RESET: 'IOTA/SETTINGS/WALLET/RESET',
    SET_FINGERPRINT_STATUS: 'IOTA/SETTINGS/SET_FINGERPRINT_STATUS',
    ACCEPT_TERMS: 'IOTA/SETTINGS/ACCEPT_TERMS',
    ACCEPT_PRIVACY: 'IOTA/SETTINGS/ACCEPT_PRIVACY',
    TOGGLE_EMPTY_TRANSACTIONS: 'IOTA/SETTINGS/TOGGLE_EMPTY_TRANSACTIONS',
    SET_COMPLETED_FORCED_PASSWORD_UPDATE: 'IOTA/SETTINGS/SET_COMPLETED_FORCED_PASSWORD_UPDATE',
    SET_BYTETRIT_STATUS: 'IOTA/SETTINGS/SET_BYTETRIT_STATUS',
    SET_BYTETRIT_INFO: 'IOTA/SETTINGS/SET_BYTETRIT_INFO',
    SET_TRAY: 'IOTA/SETTINGS/SET_TRAY',
    SET_NOTIFICATIONS: 'IOTA/SETTINGS/SET_NOTIFICATIONS',
    SET_PROXY: 'SET_PROXY',
    RESET_NODES_LIST: 'IOTA/SETTINGS/RESET_NODES_LIST',
    SET_DEEP_LINKING: 'IOTA/SETTINGS/SET_DEEP_LINKING',
    UPDATE_QUORUM_CONFIG: 'IOTA/SETTINGS/UPDATE_QUORUM_CONFIG',
    UPDATE_NODE_AUTO_SWITCH_SETTING: 'IOTA/SETTINGS/UPDATE_NODE_AUTO_SWITCH_SETTING',
};

/**
 * Dispatch to set latest app versions in state
 *
 * @method setAppVersions
 *
 * @param {object} payload
 * @returns {{type: {string}, payload: {object} }}
 */
export const setAppVersions = (payload) => {
    Wallet.setVersions(payload);

    return {
        type: ActionTypes.SET_VERSIONS,
        payload,
    };
};

/**
 * Dispatch when user has accepted wallet's terms and conditions
 *
 * @method acceptTerms
 *
 * @returns {{type: {string} }}
 */
export const acceptTerms = () => {
    Wallet.acceptTerms();

    return {
        type: ActionTypes.ACCEPT_TERMS,
    };
};

/**
 * Dispatch when user has accepted wallet's privacy agreement
 *
 * @method acceptPrivacy
 *
 * @returns {{type: {string} }}
 */
export const acceptPrivacy = () => {
    Wallet.acceptPrivacyPolicy();

    return {
        type: ActionTypes.ACCEPT_PRIVACY,
    };
};

/**
 * Dispatch when a network call for fetching currency information (conversion rates) is about to be made
 *
 * @method currencyDataFetchRequest
 *
 * @returns {{type: {string} }}
 */
const currencyDataFetchRequest = () => ({
    type: ActionTypes.CURRENCY_DATA_FETCH_REQUEST,
});

/**
 * Dispatch when currency information (conversion rates) is about to be fetched
 *
 * @method currencyDataFetchSuccess
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const currencyDataFetchSuccess = (payload) => {
    Wallet.updateCurrencyData(payload);

    return {
        type: ActionTypes.CURRENCY_DATA_FETCH_SUCCESS,
        payload,
    };
};

/**
 * Dispatch when there is an error fetching currency information
 *
 * @method currencyDataFetchError
 *
 * @returns {{type: {string} }}
 */
const currencyDataFetchError = () => ({
    type: ActionTypes.CURRENCY_DATA_FETCH_ERROR,
});

/**
 * Dispatch when a network call is about to be made for checking node's health during node change operation
 *
 * @method setNodeRequest
 *
 * @returns {{type: {string} }}
 */
const setNodeRequest = () => ({
    type: ActionTypes.SET_NODE_REQUEST,
});

/**
 * Dispatch when an error occurs while checking node's health during node change operation
 *
 * @method setNodeError
 *
 * @returns {{type: {string} }}
 */
const setNodeError = () => ({
    type: ActionTypes.SET_NODE_ERROR,
});

/**
 * Dispatch when a network call is about to be made for checking health of newly added IRI node
 *
 * @method addCustomNodeRequest
 *
 * @returns {{type: {string} }}
 */
const addCustomNodeRequest = () => ({
    type: ActionTypes.ADD_CUSTOM_NODE_REQUEST,
});

/**
 * Dispatch when the newly added custom node is healthy (synced)
 *
 * @method addCustomNodeSuccess
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
const addCustomNodeSuccess = (url, remotePow) => {
    // Add custom node.
    Node.addCustomNode(url, remotePow);
    // Update wallet's active node.
    Wallet.updateNode(url);

    return {
        type: ActionTypes.ADD_CUSTOM_NODE_SUCCESS,
        payload: url,
    };
};

/**
 * Dispatch when an error occurs during health check for newly added custom node
 *
 * @method addCustomNodeError
 *
 * @returns {{type: {string} }}
 */
const addCustomNodeError = () => ({
    type: ActionTypes.ADD_CUSTOM_NODE_ERROR,
});

/**
 * Dispatch to set a randomly selected node as the active node for wallet
 *
 * @method setRandomlySelectedNode
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setRandomlySelectedNode = (payload) => {
    Wallet.setRandomlySelectedNode(payload);

    return {
        type: ActionTypes.SET_RANDOMLY_SELECTED_NODE,
        payload,
    };
};

/**
 * Dispatch to change wallet's mode
 *
 * @method setMode
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setMode = (payload) => {
    Wallet.updateMode(payload);

    return {
        type: ActionTypes.SET_MODE,
        payload,
    };
};

/**
 * Dispatch to change wallet's active IRI node
 *
 * @method setNode
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setNode = (payload) => {
    Wallet.updateNode(payload);

    return {
        type: ActionTypes.SET_NODE,
        payload,
    };
};

/**
 * Dispatch to set updated list of IRI nodes for wallet
 *
 * @method setNodeList
 * @param {array} payload
 *
 * @returns {{type: {string}, payload: {array} }}
 */
export const setNodeList = (payload) => {
    Node.addNodes(payload);

    return {
        type: ActionTypes.SET_NODELIST,
        payload: map(payload, (node) => node.url),
    };
};

/**
 * Dispatch to remove an added custom node from wallet
 *
 * @method removeCustomNode
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const removeCustomNode = (payload) => {
    Node.delete(payload);

    return {
        type: ActionTypes.REMOVE_CUSTOM_NODE,
        payload,
    };
};

/**
 * Dispatch to update proof of work configuration for wallet
 *
 * @method setRemotePoW
 * @param {boolean} payload
 *
 * @returns {{type: {string}, payload: {boolean} }}
 */
export const setRemotePoW = (payload) => {
    Wallet.updateRemotePowSetting(payload);

    return {
        type: ActionTypes.SET_REMOTE_POW,
        payload,
    };
};

/**
 * Dispatch to update auto promotion configuration for wallet
 *
 * @method setAutoPromotion
 * @param {boolean} payload
 *
 * @returns {{type: {string}, payload: {boolean} }}
 */
export const setAutoPromotion = (payload) => {
    Wallet.updateAutoPromotionSetting(payload);

    return {
        type: ActionTypes.SET_AUTO_PROMOTION,
        payload,
    };
};

/**
 * Dispatch to update auto node switching configuration for wallet
 *
 * @method updateAutoNodeSwitching
 * @param {boolean} payload
 *
 * @returns {{type: {string}, payload: {boolean} }}
 */
export const updateAutoNodeSwitching = (payload) => {
    Wallet.updateAutoNodeSwitchingSetting(payload);

    return {
        type: ActionTypes.UPDATE_AUTO_NODE_SWITCHING,
        payload,
    };
};

/**
 * Dispatch to set lock screen time for wallet
 *
 * @method setLockScreenTimeout
 * @param {number} payload
 *
 * @returns {{type: {string}, payload: {number} }}
 */
export const setLockScreenTimeout = (payload) => {
    Wallet.updateLockScreenTimeout(payload);

    return {
        type: ActionTypes.SET_LOCK_SCREEN_TIMEOUT,
        payload,
    };
};

/**
 * Change wallet's active language
 *
 * @method setLocale
 * @param {string} locale
 *
 * @returns {function} dispatch
 */
export function setLocale(locale) {
    return (dispatch) => {
        i18next.changeLanguage(locale);
        Wallet.updateLocale(locale);

        return dispatch({
            type: ActionTypes.SET_LOCALE,
            payload: locale,
        });
    };
}

/**
 * Dispatch to change selected IRI node
 *
 * @method changeNode
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const changeNode = (payload) => (dispatch, getState) => {
    if (getSelectedNodeFromState(getState()) !== payload) {
        dispatch(setNode(payload));
        // Change provider on global iota instance
        changeIotaNode(payload);
    }
};

/**
 * Fetch currency information (conversion rates) for wallet
 *
 * @method getCurrencyData
 *
 * @param {string} currency
 * @param {boolean} withAlerts
 *
 * @returns {function(*): Promise<any>}
 */
export function getCurrencyData(currency, withAlerts = false) {
    const url = 'https://trinity-exchange-rates.herokuapp.com/api/latest?base=USD';
    return (dispatch) => {
        dispatch(currencyDataFetchRequest());

        return fetch(url)
            .then(
                (response) => response.json(),
                () => {
                    dispatch(currencyDataFetchError());

                    if (withAlerts) {
                        dispatch(
                            generateAlert(
                                'error',
                                i18next.t('settings:couldNotFetchRates'),
                                i18next.t('settings:couldNotFetchRatesExplanation', { currency: currency }),
                            ),
                        );
                    }
                },
            )
            .then((json) => {
                const conversionRate = get(json, `rates.${currency}`) || 1;
                const availableCurrencies = keys(get(json, 'rates'));

                const payload = { conversionRate, currency, availableCurrencies };

                // Update redux
                dispatch(currencyDataFetchSuccess(payload));

                if (withAlerts) {
                    dispatch(
                        generateAlert(
                            'success',
                            i18next.t('settings:fetchedConversionRates'),
                            i18next.t('settings:fetchedConversionRatesExplanation', { currency: currency }),
                        ),
                    );
                }
            });
    };
}

/**
 * Dispatch to change wallet's active language
 *
 * @method setLanguage
 * @param {string} language
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export function setLanguage(language) {
    Wallet.updateLanguage(language);

    return {
        type: ActionTypes.SET_LANGUAGE,
        payload: language,
    };
}

/**
 * Makes an API call to check if a node is healthy/active and then changes the selected node for wallet
 *
 * @method setFullNode
 *
 * @param {string} node
 * @param {boolean} addingCustomNode
 *
 * @returns {function}
 */
export function setFullNode(node, addingCustomNode = false) {
    const dispatcher = {
        request: addingCustomNode ? addCustomNodeRequest : setNodeRequest,
        success: addingCustomNode ? addCustomNodeSuccess : setNode,
        error: addingCustomNode ? addCustomNodeError : setNodeError,
        alerts: {
            defaultError: (err) =>
                addingCustomNode
                    ? generateAlert(
                          'error',
                          i18next.t('addCustomNode:customNodeCouldNotBeAdded'),
                          i18next.t('addCustomNode:invalidNodeResponse'),
                          7000,
                      )
                    : generateAlert(
                          'error',
                          i18next.t('settings:nodeChangeError'),
                          i18next.t('settings:nodeChangeErrorExplanation'),
                          7000,
                          err,
                      ),
        },
    };

    return (dispatch) => {
        dispatch(dispatcher.request());

        throwIfNodeNotHealthy(node)
            .then(() => allowsRemotePow(node))
            .then((hasRemotePow) => {
                // Change IOTA provider on the global iota instance
                changeIotaNode(node);

                // Update node in redux store
                dispatch(dispatcher.success(node, hasRemotePow));

                // Change IOTA provider on the global iota instance
                changeIotaNode(node);

                if (hasRemotePow) {
                    dispatch(
                        generateAlert(
                            'success',
                            i18next.t('settings:nodeChangeSuccess'),
                            i18next.t('settings:nodeChangeSuccessExplanation', { node }),
                            10000,
                        ),
                    );
                } else {
                    // Automatically default to local PoW if this node has no attach to tangle available
                    dispatch(setRemotePoW(false));
                    dispatch(setAutoPromotion(false));

                    dispatch(
                        generateAlert(
                            'success',
                            i18next.t('settings:nodeChangeSuccess'),
                            i18next.t('settings:nodeChangeSuccessNoRemotePow', { node }),
                            10000,
                        ),
                    );
                }
            })
            .catch((err) => {
                dispatch(dispatcher.error());

                if (err.message === Errors.NODE_NOT_SYNCED) {
                    dispatch(generateNodeOutOfSyncErrorAlert());
                } else if (err.message === Errors.UNSUPPORTED_NODE) {
                    dispatch(generateUnsupportedNodeErrorAlert());
                } else {
                    dispatch(dispatcher.alerts.defaultError(err));
                }
            });
    };
}

/**
 * Change wallet's active theme
 *
 * @method updateTheme
 *
 * @param {string} payload
 *
 * @returns {function} dispatch
 */
export function updateTheme(payload) {
    Wallet.updateTheme(payload);

    return (dispatch) => {
        dispatch({
            type: ActionTypes.UPDATE_THEME,
            payload,
        });
    };
}

/**
 * Makes an API call for checking if attachToTangle is enabled on the selected IRI node
 * and changes proof of work configuration for wallet
 *
 * @method changePowSettings
 *
 * @returns {function}
 */
export function changePowSettings() {
    return (dispatch, getState) => {
        const settings = getState().settings;
        if (!settings.remotePoW) {
            allowsRemotePow(settings.node).then((hasRemotePow) => {
                if (!hasRemotePow) {
                    return dispatch(
                        generateAlert(
                            'error',
                            i18next.t('global:attachToTangleUnavailable'),
                            i18next.t('global:attachToTangleUnavailableExplanationShort'),
                            10000,
                        ),
                    );
                }
                dispatch(setRemotePoW(!settings.remotePoW));
                dispatch(generateAlert('success', i18next.t('pow:powUpdated'), i18next.t('pow:powUpdatedExplanation')));
            });
        } else {
            dispatch(setRemotePoW(!settings.remotePoW));
            dispatch(generateAlert('success', i18next.t('pow:powUpdated'), i18next.t('pow:powUpdatedExplanation')));
        }
    };
}

/**
 * Makes an API call for checking if attachToTangle is enabled on the selected IRI node
 * and changes auto promotion configuration for wallet
 *
 * @method changeAutoPromotionSettings
 *
 * @returns {function}
 */
export function changeAutoPromotionSettings() {
    return (dispatch, getState) => {
        const settings = getState().settings;
        if (!settings.autoPromotion) {
            allowsRemotePow(settings.node).then((hasRemotePow) => {
                if (!hasRemotePow) {
                    return dispatch(
                        generateAlert(
                            'error',
                            i18next.t('global:attachToTangleUnavailable'),
                            i18next.t('global:attachToTangleUnavailableExplanationShort'),
                            10000,
                        ),
                    );
                }
                dispatch(setAutoPromotion(!settings.autoPromotion));
                dispatch(
                    generateAlert(
                        'success',
                        i18next.t('autoPromotion:autoPromotionUpdated'),
                        i18next.t('autoPromotion:autoPromotionUpdatedExplanation'),
                    ),
                );
            });
        } else {
            dispatch(setAutoPromotion(!settings.autoPromotion));
            dispatch(
                generateAlert(
                    'success',
                    i18next.t('autoPromotion:autoPromotionUpdated'),
                    i18next.t('autoPromotion:autoPromotionUpdatedExplanation'),
                ),
            );
        }
    };
}

/**
 * Dispatch to reset wallet's state
 *
 * @method resetWallet
 *
 * @returns {{type: {string} }}
 */
export function resetWallet() {
    return {
        type: ActionTypes.WALLET_RESET,
    };
}

/**
 * Dispatch to show/hide empty transactions in transactions history
 *
 * @method toggleEmptyTransactions
 *
 * @returns {{type: {string} }}
 */
export const toggleEmptyTransactions = () => {
    Wallet.toggleEmptyTransactionsDisplay();

    return {
        type: ActionTypes.TOGGLE_EMPTY_TRANSACTIONS,
    };
};

/**
 * Dispatch to update wallet's fingerprint authentication configuration
 *
 * @method setFingerprintStatus
 * @param {boolean} payload
 *
 * @returns {{type: {string}, payload: {boolean} }}
 */
export const setFingerprintStatus = (payload) => {
    Wallet.updateFingerprintAuthenticationSetting(payload);

    return {
        type: ActionTypes.SET_FINGERPRINT_STATUS,
        payload,
    };
};

// FIXME: Temporarily needed for password migration
export const setCompletedForcedPasswordUpdate = () => {
    Wallet.completeForcedPasswordUpdate();

    return {
        type: ActionTypes.SET_COMPLETED_FORCED_PASSWORD_UPDATE,
    };
};

// FIXME: Temporarily needed for byte-trit check
export const setCompletedByteTritSweep = (payload) => {
    Wallet.updateByteTritSweepSetting(payload);

    return {
        type: ActionTypes.SET_BYTETRIT_STATUS,
        payload,
    };
};

// FIXME: Temporarily needed for byte-trit check
export const setByteTritSweepInfo = (payload) => ({
    type: ActionTypes.SET_BYTETRIT_INFO,
    payload,
});

/**
 * Dispatch to set if tray application is enabled
 *
 * @method setTray
 * @param {boolean} payload
 *
 * @returns {{type: {string}, payload: {boolean} }}
 */
export const setTray = (payload) => {
    Wallet.updateTraySetting(payload);

    return {
        type: ActionTypes.SET_TRAY,
        payload,
    };
};

/**
 * Dispatch to set if native notifications are enabled
 *
 * @method setNotifications
 * @param {{type: {string}, enabled: {boolean}}}} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const setNotifications = (payload) => {
    Wallet.updateNotificationsSetting(payload);

    return {
        type: ActionTypes.SET_NOTIFICATIONS,
        payload,
    };
};

/**
 * Dispatch to update proxy settings
 *
 * @method setProxy
 * @param {boolean} payload
 *
 * @returns {{type: {string}, payload: {boolean} }}
 */
export const setProxy = (payload) => ({
    type: ActionTypes.SET_PROXY,
    payload,
});

/**
 * Changes deep linking setting and generates alert
 *
 * @method changeDeepLinkingSettings
 */
export const changeDeepLinkingSettings = () => {
    return (dispatch, getState) => {
        const settings = getState().settings;
        dispatch(setDeepLinking());
        dispatch(
            generateAlert(
                'success',
                i18next.t('deepLink:deepLinkingUpdated'),
                settings.deepLinking
                    ? i18next.t('deepLink:deepLinkingDisabled')
                    : i18next.t('deepLink:deepLinkingEnabled'),
            ),
        );
    };
};

/**
 * Dispatch to update deep linking settings
 *
 * @method setDeepLinking
 * @param {boolean} payload
 *
 * @returns {{type: {string}, payload: {boolean} }}
 */
export const setDeepLinking = () => {
    Wallet.updateDeepLinkingSetting();
    return {
        type: ActionTypes.SET_DEEP_LINKING,
    };
};

/**
 * Dispatch to reset nodes list
 *
 * @method resetNodesList
 *
 * @returns {{type: {string} }}
 */
export const resetNodesList = () => ({
    type: ActionTypes.RESET_NODES_LIST,
});

/**
 * Reinitialise (clear existing and fetch latest) nodes
 *
 * @method reinitialiseNodesList
 *
 * @returns {function} dispatch
 */
export const reinitialiseNodesList = () => (dispatch) => {
    // First reset the existing nodes in the state
    dispatch(resetNodesList());

    // Fetch latest nodes
    dispatch(fetchNodeList());
};

/**
 * Dispatch to update quorum configuration
 *
 * @method updateQuorumConfig
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const updateQuorumConfig = (payload) => ({
    type: ActionTypes.UPDATE_QUORUM_CONFIG,
    payload,
});

/**
 * Dispatch to update node auto-switch setting
 *
 * @method updateNodeAutoSwitchSetting
 * @param {boolean} payload
 *
 * @returns {{type: {string}, payload: {boolean} }}
 */
export const updateNodeAutoSwitchSetting = (payload) => ({
    type: ActionTypes.UPDATE_NODE_AUTO_SWITCH_SETTING,
    payload,
});
