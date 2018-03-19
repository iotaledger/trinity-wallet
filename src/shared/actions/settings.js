import get from 'lodash/get';
import { getStoredState } from 'redux-persist';
import { updatePersistedState } from '../libs/util';
import { generateAlert } from './alerts';
import i18next from '../i18next';
import { UPDATE_URL } from '../config';

export const ActionTypes = {
    SET_LOCALE: 'IOTA/SETTINGS/LOCALE',
    SET_FULLNODE: 'IOTA/SETTINGS/FULLNODE',
    ADD_CUSTOM_NODE: 'IOTA/SETTINGS/ADD_CUSTOM_NODE',
    ADD_CUSTOM_POW_NODE: 'IOTA/SETTINGS/ADD_CUSTOM_POW_NODE',
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
    UPDATE_POW_SETTINGS: 'IOTA/SETTINGS/UPDATE_POW_SETTINGS',
    SET_VERSIONS: 'IOTA/SETTINGS/WALLET/SET_VERSIONS',
    WALLET_RESET: 'IOTA/SETTINGS/WALLET/RESET',
    SET_2FA_STATUS: 'IOTA/SETTINGS/SET_2FA_STATUS',
    SET_FINGERPRINT_STATUS: 'IOTA/SETTINGS/SET_FINGERPRINT_STATUS',
};

export const setAppVersions = (payload) => ({
    type: ActionTypes.SET_VERSIONS,
    payload,
});

const currencyDataFetchRequest = () => ({
    type: ActionTypes.CURRENCY_DATA_FETCH_REQUEST,
});

const currencyDataFetchSuccess = (payload) => ({
    type: ActionTypes.CURRENCY_DATA_FETCH_SUCCESS,
    payload,
});

const currencyDataFetchError = () => ({
    type: ActionTypes.CURRENCY_DATA_FETCH_ERROR,
});

export const setRandomlySelectedNode = (payload) => ({
    type: ActionTypes.SET_RANDOMLY_SELECTED_NODE,
    payload,
});

export const setMode = (payload) => ({
    type: ActionTypes.SET_MODE,
    payload,
});

export const updatePowSettings = () => ({
    type: ActionTypes.UPDATE_POW_SETTINGS,
});

export function setLocale(locale) {
    return {
        type: ActionTypes.SET_LOCALE,
        payload: locale,
    };
}

export function getCurrencyData(currency, withAlerts = false) {
    const url = 'https://api.fixer.io/latest?base=USD';
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
                dispatch(
                    currencyDataFetchSuccess({
                        conversionRate,
                        currency,
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

export function setFullNode(fullNode) {
    return (dispatch) => {
        dispatch({
            type: ActionTypes.SET_FULLNODE,
            payload: fullNode,
        });
    };
}

export function addCustomPoWNode(customNode) {
    return (dispatch) => {
        dispatch({
            type: ActionTypes.ADD_CUSTOM_POW_NODE,
            payload: customNode,
        });
    };
}

export function addCustomNode(customNode) {
    return (dispatch) => {
        dispatch({
            type: ActionTypes.ADD_CUSTOM_NODE,
            payload: customNode,
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

export const setFingerprintStatus = (payload) => ({
    type: ActionTypes.SET_FINGERPRINT_STATUS,
    payload,
});
