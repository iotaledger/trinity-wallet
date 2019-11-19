import { UiActionTypes } from '../types';

/**
 * Dispatch to set QR message in state
 *
 * @method setQrMessage
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setQrMessage = (payload) => ({
    type: UiActionTypes.SET_QR_MESSAGE,
    payload,
});

/**
 * Dispatch to set QR amount in state
 *
 * @method setQrAmount
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setQrAmount = (payload) => ({
    type: UiActionTypes.SET_QR_AMOUNT,
    payload,
});

/**
 * Dispatch to set QR tag in state
 *
 * @method setQrTag
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setQrTag = (payload) => ({
    type: UiActionTypes.SET_QR_TAG,
    payload,
});

/**
 * Dispatch to set QR denomination in state
 *
 * @method setQrDenomination
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setQrDenomination = (payload) => ({
    type: UiActionTypes.SET_QR_DENOMINATION,
    payload,
});

/**
 * Dispatch to set selected QR tab on receive page (mobile)
 *
 * @method setSelectedQrTab
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setSelectedQrTab = (payload) => ({
    type: UiActionTypes.SET_SELECTED_QR_TAB,
    payload,
});

/**
 * Dispatch to set address field text on send page (mobile)
 *
 * @method setSendAddressField
 *
 * @returns {{type: {string} }}
 */
export const setSendAddressField = (payload) => ({
    type: UiActionTypes.SET_SEND_ADDRESS_FIELD,
    payload,
});

/**
 * Dispatch to set amount field text on send page (mobile)
 *
 * @method setSendAmountField
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setSendAmountField = (payload) => ({
    type: UiActionTypes.SET_SEND_AMOUNT_FIELD,
    payload,
});

/**
 * Dispatch to set message field text on send page (mobile)
 *
 * @method setSendMessageField
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setSendMessageField = (payload) => ({
    type: UiActionTypes.SET_SEND_MESSAGE_FIELD,
    payload,
});

/**
 * Dispatch to clear text fields on send page (mobile)
 *
 * @method clearSendFields
 *
 * @returns {{type: {string} }}
 */
export const clearSendFields = () => ({
    type: UiActionTypes.CLEAR_SEND_FIELDS,
});

/**
 * Dispatch to set denomination on send page (mobile)
 *
 *
 * @method setSendDenomination
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setSendDenomination = (payload) => ({
    type: UiActionTypes.SET_SEND_DENOMINATION,
    payload,
});

/**
 * Dispatch to set user's wallet activity (inactive, minimised, active) in state
 *
 * @method setUserActivity
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const setUserActivity = (payload) => ({
    type: UiActionTypes.SET_USER_ACTIVITY,
    payload,
});

/**
 * Dispatch to disable wallet's active features (when app is minimised)
 *
 * @method setDoNotMinimise
 * @param {boolean} payload
 *
 * @returns {{type: {string}, payload: {boolean} }}
 */
export const setDoNotMinimise = (payload) => {
    return {
        type: UiActionTypes.SET_DO_NOT_MINIMISE,
        payload,
    };
};

/**
 * Dispatch to show/hide modal on mobile
 *
 * @method toggleModalActivity
 *
 * @returns {{type: {string}, modalContent: {string}, modalProps: {object} }}
 */
export const toggleModalActivity = (modalContent, modalProps) => {
    return {
        type: UiActionTypes.TOGGLE_MODAL_ACTIVITY,
        modalContent,
        modalProps,
    };
};

/**
 * Dispatch to update modal props
 *
 * @method updateModalProps
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const updateModalProps = (payload) => {
    return {
        type: UiActionTypes.UPDATE_MODAL_PROPS,
        payload,
    };
};

/**
 * Dispatch to set active child route on login page (mobile)
 *
 * @method setLoginRoute
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setLoginRoute = (payload) => {
    return {
        type: UiActionTypes.SET_LOGIN_ROUTE,
        payload,
    };
};

/**
 * Dispatch to set the keyboard as active (mobile only)
 *
 * @method setKeyboardActivity
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setKeyboardActivity = (payload) => {
    return {
        type: UiActionTypes.SET_KEYBOARD_ACTIVITY,
        payload,
    };
};

/**
 * Dispatch to set whether the chart line should animate on mount
 *
 * @method setAnimateChartOnMount
 * @param {bool} payload
 *
 * @returns {{type: {string}, payload: {bool} }}
 */
export const setAnimateChartOnMount = (payload) => {
    return {
        type: UiActionTypes.SET_ANIMATE_CHART_ON_MOUNT,
        payload,
    };
};

/**
 * Dispatch to set whether the Moonpay history tab should be displayed
 *
 * @method setViewingMoonpayPurchases
 * @param {bool} payload
 *
 * @returns {{type: {string}, payload: {bool} }}
 */
export const setViewingMoonpayPurchases = (payload) => {
    return {
        type: UiActionTypes.SET_VIEWING_MOONPAY_PURCHASES,
        payload,
    };
};
