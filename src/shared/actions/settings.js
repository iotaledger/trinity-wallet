import get from 'lodash/get';
import keys from 'lodash/keys';
import { getStoredState } from 'redux-persist';
import { changeIotaNode } from '../libs/iota';
import { updatePersistedState } from '../libs/utils';
import { generateAlert } from './alerts';
import i18next from '../i18next';
import { UPDATE_URL } from '../config';
import { isNodeSynced, checkAttachToTangleAsync } from '../libs/iota/extendedApi';
import Errors from '../libs/errors';

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
    SET_UPDATE_ERROR: 'IOTA/SETTINGS/SET_UPDATE_ERROR',
    SET_UPDATE_SUCCESS: 'IOTA/SETTINGS/UPDATE_SUCCESS',
    SET_UPDATE_DONE: 'IOTA/SETTINGS/UPDATE_DONE',
    SET_NODELIST: 'IOTA/SETTINGS/SET_NODELIST',
    SET_REMOTE_POW: 'IOTA/SETTINGS/SET_REMOTE_POW',
    SET_AUTO_PROMOTION: 'IOTA/SETTINGS/SET_AUTO_PROMOTION',
    SET_BACKGROUND_PROCESSES: 'IOTA/SETTINGS/SET_BACKGROUND_PROCESSES',
    UPDATE_AUTO_NODE_SWITCHING: 'IOTA/SETTINGS/UPDATE_AUTO_NODE_SWITCHING',
    SET_LOCK_SCREEN_TIMEOUT: 'IOTA/SETTINGS/SET_LOCK_SCREEN_TIMEOUT',
    SET_VERSIONS: 'IOTA/SETTINGS/WALLET/SET_VERSIONS',
    WALLET_RESET: 'IOTA/SETTINGS/WALLET/RESET',
    SET_2FA_STATUS: 'IOTA/SETTINGS/SET_2FA_STATUS',
    SET_FINGERPRINT_STATUS: 'IOTA/SETTINGS/SET_FINGERPRINT_STATUS',
    ACCEPT_TERMS: 'IOTA/SETTINGS/ACCEPT_TERMS',
    ACCEPT_PRIVACY: 'IOTA/SETTINGS/ACCEPT_PRIVACY',
    SET_SEED_SHARE_TUTORIAL_VISITATION_STATUS: 'IOTA/SETTINGS/SET_SEED_SHARE_TUTORIAL_VISITATION_STATUS',
    TOGGLE_EMPTY_TRANSACTIONS: 'IOTA/SETTINGS/TOGGLE_EMPTY_TRANSACTIONS',
};

export const setAppVersions = (payload) => ({
    type: ActionTypes.SET_VERSIONS,
    payload,
});

export const acceptTerms = () => ({
    type: ActionTypes.ACCEPT_TERMS,
});

export const acceptPrivacy = () => ({
    type: ActionTypes.ACCEPT_PRIVACY,
});

const currencyDataFetchRequest = () => ({
    type: ActionTypes.CURRENCY_DATA_FETCH_REQUEST,
});

export const currencyDataFetchSuccess = (payload) => ({
    type: ActionTypes.CURRENCY_DATA_FETCH_SUCCESS,
    payload,
});

const currencyDataFetchError = () => ({
    type: ActionTypes.CURRENCY_DATA_FETCH_ERROR,
});

const setNodeRequest = () => ({
    type: ActionTypes.SET_NODE_REQUEST,
});

const setNodeError = () => ({
    type: ActionTypes.SET_NODE_ERROR,
});

const addCustomNodeRequest = () => ({
    type: ActionTypes.ADD_CUSTOM_NODE_REQUEST,
});

const addCustomNodeSuccess = (payload) => ({
    type: ActionTypes.ADD_CUSTOM_NODE_SUCCESS,
    payload,
});

const addCustomNodeError = () => ({
    type: ActionTypes.ADD_CUSTOM_NODE_ERROR,
});

export const setRandomlySelectedNode = (payload) => ({
    type: ActionTypes.SET_RANDOMLY_SELECTED_NODE,
    payload,
});

export const setMode = (payload) => ({
    type: ActionTypes.SET_MODE,
    payload,
});

export const setNode = (payload) => ({
    type: ActionTypes.SET_NODE,
    payload,
});

export const setNodeList = (payload) => ({
    type: ActionTypes.SET_NODELIST,
    payload,
});

export const removeCustomNode = (payload) => ({
    type: ActionTypes.REMOVE_CUSTOM_NODE,
    payload,
});

export const setRemotePoW = (payload) => ({
    type: ActionTypes.SET_REMOTE_POW,
    payload,
});

export const setAutoPromotion = (payload) => ({
    type: ActionTypes.SET_AUTO_PROMOTION,
    payload,
});

export const setBackgroundProcesses = (payload) => ({
    type: ActionTypes.SET_BACKGROUND_PROCESSES,
    payload,
});

export const updateAutoNodeSwitching = (payload) => ({
    type: ActionTypes.UPDATE_AUTO_NODE_SWITCHING,
    payload,
});

export const setLockScreenTimeout = (payload) => ({
    type: ActionTypes.SET_LOCK_SCREEN_TIMEOUT,
    payload,
});

export function setLocale(locale) {
    return (dispatch) => {
        i18next.changeLanguage(locale);
        return dispatch({
            type: ActionTypes.SET_LOCALE,
            payload: locale,
        });
    };
}

export const setSeedShareTutorialVisitationStatus = (payload) => ({
    type: ActionTypes.SET_SEED_SHARE_TUTORIAL_VISITATION_STATUS,
    payload,
});

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
                dispatch(
                    currencyDataFetchSuccess({
                        conversionRate,
                        currency,
                        availableCurrencies,
                    }),
                );

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

export function setLanguage(language) {
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

        // Passing in provider will create a new IOTA instance
        isNodeSynced(node)
            .then((isSynced) => {
                if (!isSynced) {
                    throw new Error(Errors.NODE_NOT_SYNCED);
                }

                return checkAttachToTangleAsync(node);
            })
            .then((res) => {
                // Change IOTA provider on the global iota instance
                changeIotaNode(node);

                // Update node in redux store
                dispatch(dispatcher.success(node));

                if (res.error.includes(Errors.INVALID_PARAMETERS)) {
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
                    dispatch(
                        generateAlert(
                            'error',
                            i18next.t('settings:nodeChangeError'),
                            i18next.t('settings:thisNodeOutOfSync'),
                            7000,
                        ),
                    );
                } else {
                    dispatch(dispatcher.alerts.defaultError(err));
                }
            });
    };
}

export function updateTheme(theme, themeName) {
    return (dispatch) => {
        dispatch({
            type: ActionTypes.UPDATE_THEME,
            theme,
            themeName,
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
            checkAttachToTangleAsync(settings.node).then((res) => {
                if (res.error.includes(Errors.ATTACH_TO_TANGLE_UNAVAILABLE)) {
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
            checkAttachToTangleAsync(settings.node).then((res) => {
                if (res.error.includes(Errors.ATTACH_TO_TANGLE_UNAVAILABLE)) {
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

/** Receives new release data and updates the release state
 * @param {Boolean} force - should confirmation dialog be forced
 */
export function getUpdateData(force) {
    return (dispatch) => {
        return fetch(UPDATE_URL)
            .then(
                (response) => response.json(),
                () => {
                    dispatch({
                        type: ActionTypes.SET_UPDATE_ERROR,
                        payload: {
                            force,
                        },
                    });
                },
            )
            .then((json) => {
                if (json && json.version) {
                    dispatch({
                        type: ActionTypes.SET_UPDATE_SUCCESS,
                        payload: {
                            version: json.version,
                            notes: json.notes,
                            force,
                        },
                    });
                }
            });
    };
}

/** Set update version state as done */
export function setUpdateDone() {
    return (dispatch) => {
        dispatch({
            type: ActionTypes.SET_UPDATE_DONE,
        });
    };
}

export function resetWallet() {
    return {
        type: ActionTypes.WALLET_RESET,
    };
}

export const migrate = (versions, config, persistor) => (dispatch, getState) => {
    let restoredState = {};
    getStoredState(config)
        .then((persistedState) => {
            restoredState = persistedState;

            if (persistor) {
                return persistor.purge();
            }

            throw new Error('persistor not defined.');
        })
        .then(() => {
            dispatch(resetWallet());
            dispatch(setAppVersions(versions));

            const updatedState = updatePersistedState(getState(), restoredState);

            if (persistor) {
                persistor.rehydrate(updatedState);
            }
        })
        .catch((err) => console.error(err));
};

export const set2FAStatus = (payload) => ({
    type: ActionTypes.SET_2FA_STATUS,
    payload,
});

export const toggleEmptyTransactions = () => {
    return {
        type: ActionTypes.TOGGLE_EMPTY_TRANSACTIONS,
    };
};

export const setFingerprintStatus = (payload) => ({
    type: ActionTypes.SET_FINGERPRINT_STATUS,
    payload,
});
