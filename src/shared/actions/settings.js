import unionBy from 'lodash/unionBy';
import assign from 'lodash/assign';
import get from 'lodash/get';
import omit from 'lodash/omit';
import { changeIotaNode, quorum } from '../libs/iota/index';
import i18next from '../libs/i18next';
import { generateAlert, generateNodeOutOfSyncErrorAlert, generateUnsupportedNodeErrorAlert } from '../actions/alerts';
import { fetchNodeList } from '../actions/polling';
import { allowsRemotePow } from '../libs/iota/extendedApi';
import {
    getSelectedNodeFromState,
    getNodesFromState,
    getCustomNodesFromState,
    getRandomPowNodeFromState,
} from '../selectors/global';
import { throwIfNodeNotHealthy } from '../libs/iota/utils';
import Errors from '../libs/errors';
import { Wallet, Node } from '../storage';
import { SettingsActionTypes } from '../types';

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
        type: SettingsActionTypes.SET_VERSIONS,
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
        type: SettingsActionTypes.ACCEPT_TERMS,
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
        type: SettingsActionTypes.ACCEPT_PRIVACY,
    };
};

/**
 * Dispatch when a network call is about to be made for checking node's health during node change operation
 *
 * @method setNodeRequest
 *
 * @returns {{type: {string} }}
 */
const setNodeRequest = () => ({
    type: SettingsActionTypes.SET_NODE_REQUEST,
});

/**
 * Dispatch when an error occurs while checking node's health during node change operation
 *
 * @method setNodeError
 *
 * @returns {{type: {string} }}
 */
const setNodeError = () => ({
    type: SettingsActionTypes.SET_NODE_ERROR,
});

/**
 * Dispatch when a network call is about to be made for checking health of newly added IRI node
 *
 * @method addCustomNodeRequest
 *
 * @returns {{type: {string} }}
 */
const addCustomNodeRequest = () => ({
    type: SettingsActionTypes.ADD_CUSTOM_NODE_REQUEST,
});

/**
 * Dispatch when the newly added custom node is healthy (synced)
 *
 * @method addCustomNodeSuccess
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
const addCustomNodeSuccess = (node, remotePow) => {
    // Add custom node.
    Node.addCustomNode(node, remotePow);

    return {
        type: SettingsActionTypes.ADD_CUSTOM_NODE_SUCCESS,
        payload: node,
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
    type: SettingsActionTypes.ADD_CUSTOM_NODE_ERROR,
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
        type: SettingsActionTypes.SET_RANDOMLY_SELECTED_NODE,
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
        type: SettingsActionTypes.SET_MODE,
        payload,
    };
};

/**
 * Dispatch to change wallet's active IRI node
 *
 * @method setNode
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setNode = (payload) => {
    Wallet.updateNode(payload.url);

    return {
        type: SettingsActionTypes.SET_NODE,
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

    return (dispatch, getState) => {
        dispatch({
            type: SettingsActionTypes.SET_NODELIST,
            payload,
        });

        const { settings } = getState();
        const nodes = [...settings.nodes, ...settings.customNodes];

        const powNodeExists = settings.powNode && nodes.find(({ url }) => url === settings.powNode);

        if (!powNodeExists) {
            return dispatch(setPowNode(getRandomPowNodeFromState(getState())));
        }
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

    return (dispatch, getState) => {
        dispatch({
            type: SettingsActionTypes.REMOVE_CUSTOM_NODE,
            payload,
        });

        const { settings } = getState();

        if (settings.powNode === payload) {
            return dispatch(setPowNode(getRandomPowNodeFromState(getState())));
        }
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
        type: SettingsActionTypes.SET_REMOTE_POW,
        payload,
    };
};

/**
 * Dispatch to update proof of work node configuration for wallet
 *
 * @method setRemotePoW
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {boolean} }}
 */
export const setPowNode = (payload) => {
    Wallet.updatePowNodeSetting(payload);

    return {
        type: SettingsActionTypes.SET_POW_NODE,
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
        type: SettingsActionTypes.SET_AUTO_PROMOTION,
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
        type: SettingsActionTypes.SET_LOCK_SCREEN_TIMEOUT,
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
            type: SettingsActionTypes.SET_LOCALE,
            payload: locale,
        });
    };
}

/**
 * Dispatch to change selected IRI node
 *
 * @method changeNode
 *
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const changeNode = (payload) => (dispatch, getState) => {
    const selectedNode = getSelectedNodeFromState(getState());

    if (selectedNode.url !== payload.url) {
        dispatch(setNode(payload));
        // Change provider on global iota instance
        changeIotaNode(assign({}, omit(payload, 'url'), { provider: payload.url }));
    }
};

/**
 * Set wallet currency information
 *
 * @method setCurrency
 *
 * @param {string} currency
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setCurrency = (currency) => (dispatch, getState) => {
    const { marketData } = getState();
    const conversionRate = marketData.rates[currency] || 1;

    dispatch({
        type: SettingsActionTypes.SET_CURRENCY,
        payload: {
            currency,
            conversionRate,
        },
    });
};

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
        type: SettingsActionTypes.SET_LANGUAGE,
        payload: language,
    };
}

/**
 * Makes an API call to check if a node is healthy/active and then changes the selected node for wallet
 *
 * @method setFullNode
 *
 * @param {object} node - { url, username }
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
                if (!addingCustomNode) {
                    changeIotaNode(assign({}, node, { provider: node.url }));
                }

                // Update node in redux store
                dispatch(
                    dispatcher.success(
                        assign({}, node, {
                            pow: hasRemotePow,
                        }),
                        hasRemotePow,
                    ),
                );

                if (addingCustomNode) {
                    return dispatch(
                        generateAlert(
                            'success',
                            i18next.t('global:customNodeAdded'),
                            i18next.t('global:customNodeAddedExplanation', { node: node.url }),
                            10000,
                        ),
                    );
                }

                if (hasRemotePow) {
                    dispatch(
                        generateAlert(
                            'success',
                            i18next.t('settings:nodeChangeSuccess'),
                            i18next.t('settings:nodeChangeSuccessExplanation', { node: node.url }),
                            10000,
                        ),
                    );
                } else {
                    // Automatically default to local PoW if this node has no attach to tangle available
                    dispatch(setRemotePoW(false));

                    dispatch(
                        generateAlert(
                            'success',
                            i18next.t('settings:nodeChangeSuccess'),
                            i18next.t('settings:nodeChangeSuccessNoRemotePow', { node: node.url }),
                            10000,
                        ),
                    );
                }
            })
            .catch((err) => {
                dispatch(dispatcher.error());

                if (get(err, 'message') === Errors.NODE_NOT_SYNCED) {
                    dispatch(generateNodeOutOfSyncErrorAlert(err));
                } else if (get(err, 'message') === Errors.NODE_NOT_SYNCED_BY_TIMESTAMP) {
                    dispatch(generateNodeOutOfSyncErrorAlert(err, true));
                } else if (get(err, 'message') === Errors.UNSUPPORTED_NODE) {
                    dispatch(generateUnsupportedNodeErrorAlert(err));
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
            type: SettingsActionTypes.UPDATE_THEME,
            payload,
        });
    };
}

/**
 * Changes proof of work configuration for wallet
 *
 * @method changePowSettings
 *
 * @returns {function}
 */
export function changePowSettings() {
    return (dispatch, getState) => {
        dispatch(setRemotePoW(!getState().settings.remotePoW));
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
        if (!settings.autoPromotion && !settings.powNode) {
            dispatch(setPowNode(getRandomPowNodeFromState(getState())));
        }
        dispatch(setAutoPromotion(!settings.autoPromotion));
        dispatch(
            generateAlert(
                'success',
                i18next.t('autoPromotion:autoPromotionUpdated'),
                i18next.t('autoPromotion:autoPromotionUpdatedExplanation'),
            ),
        );
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
        type: SettingsActionTypes.WALLET_RESET,
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
        type: SettingsActionTypes.TOGGLE_EMPTY_TRANSACTIONS,
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
        type: SettingsActionTypes.SET_FINGERPRINT_STATUS,
        payload,
    };
};

// FIXME: Temporarily needed for password migration
export const setCompletedForcedPasswordUpdate = () => {
    Wallet.completeForcedPasswordUpdate();

    return {
        type: SettingsActionTypes.SET_COMPLETED_FORCED_PASSWORD_UPDATE,
    };
};

// FIXME: Temporarily needed for byte-trit check
export const setCompletedByteTritSweep = (payload) => {
    Wallet.updateByteTritSweepSetting(payload);

    return {
        type: SettingsActionTypes.SET_BYTETRIT_STATUS,
        payload,
    };
};

// FIXME: Temporarily needed for byte-trit check
export const setByteTritSweepInfo = (payload) => ({
    type: SettingsActionTypes.SET_BYTETRIT_INFO,
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
        type: SettingsActionTypes.SET_TRAY,
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
        type: SettingsActionTypes.SET_NOTIFICATIONS,
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
export const setProxy = (payload) => {
    Wallet.updateIgnoreProxySetting(payload);

    return {
        type: SettingsActionTypes.SET_PROXY,
        payload,
    };
};

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
        type: SettingsActionTypes.SET_DEEP_LINKING,
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
    type: SettingsActionTypes.RESET_NODES_LIST,
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
export const updateQuorumConfig = (payload) => {
    // Update quorum configuration in realm
    Wallet.updateQuorumConfig(payload);

    // Check if this update aims to update quorum size
    const quorumSize = get(payload, 'size');

    // If this update aims to update quorum size, also update global quorum parameter
    if (quorumSize) {
        quorum.setSize(quorumSize);
    }

    // Finally, update it in redux store
    return {
        type: SettingsActionTypes.UPDATE_QUORUM_CONFIG,
        payload,
    };
};

/**
 * Dispatch to update node auto-switch setting
 *
 * @method updateNodeAutoSwitchSetting
 * @param {boolean} payload
 *
 * @returns {{type: {string}, payload: {boolean} }}
 */
export const updateNodeAutoSwitchSetting = (payload) => {
    // Update auto node switching setting in realm
    Wallet.updateNodeAutoSwitchSetting(payload);

    // Update auto node switching setting in redux store
    return {
        type: SettingsActionTypes.UPDATE_NODE_AUTO_SWITCH_SETTING,
        payload,
    };
};

/**
 * Dispatch to update proof of work node auto-switch setting
 *
 * @method updatePowNodeAutoSwitchSetting
 * @param {boolean} payload
 *
 * @returns {{type: {string}, payload: {boolean} }}
 */
export const updatePowNodeAutoSwitchSetting = (payload) => {
    // Update pow node auto switching setting in realm
    Wallet.updatePowNodeAutoSwitchSetting(payload);

    // Update pow node auto switching setting in redux store
    return {
        type: SettingsActionTypes.UPDATE_POW_NODE_AUTO_SWITCH_SETTING,
        payload,
    };
};

/**
 * Dispatch to update autoNodeList setting
 *
 * @method updateAutoNodeListSetting
 * @param {boolean} payload
 *
 * @returns {{type: {string}, payload: {boolean} }}
 */
export const updateAutoNodeListSetting = (payload) => {
    // Update autoNodeList setting in realm
    Wallet.updateAutoNodeListSetting(payload);

    // Update autoNodeList setting in redux
    return {
        type: SettingsActionTypes.UPDATE_AUTO_NODE_LIST_SETTING,
        payload,
    };
};

/**
 * Dispatch to change autoNodeList setting
 *
 * @method changeAutoNodeListSetting
 *
 * @param {boolean} payload
 *
 * @returns {function} dispatch
 */
export const changeAutoNodeListSetting = (payload) => (dispatch, getState) => {
    dispatch(updateAutoNodeListSetting(payload));

    // `autoNodeList` active -> use all nodes for quorum
    // `autoNodeList` inactive -> use custom nodes for quorum
    const remoteNodes = getNodesFromState(getState());
    const customNodes = getCustomNodesFromState(getState());
    const nodes = payload ? unionBy(remoteNodes, customNodes, 'url') : customNodes;

    quorum.setNodes(nodes);
};

/**
 * Dispatch to set timeframe for IOTA time series price information
 *
 * @method setTimeframe
 * @param {string} timeframe
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setChartTimeframe = (timeframe) => {
    Wallet.updateTimeframe(timeframe);

    return {
        type: SettingsActionTypes.SET_CHART_TIMEFRAME,
        payload: timeframe,
    };
};

/**
 * Dispatch to set currency in state
 *
 * @method setCurrency
 * @param {string} currency
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setChartCurrency = (currency) => {
    Wallet.updateCurrency(currency);

    return {
        type: SettingsActionTypes.SET_CHART_CURRENCY,
        payload: currency,
    };
};
