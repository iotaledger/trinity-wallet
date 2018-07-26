export const ActionTypes = {
    SET_SEND_ADDRESS_FIELD: 'IOTA/UI/SET_SEND_ADDRESS_FIELD',
    SET_SEND_AMOUNT_FIELD: 'IOTA/UI/SET_SEND_AMOUNT_FIELD',
    SET_SEND_MESSAGE_FIELD: 'IOTA/UI/SET_SEND_MESSAGE_FIELD',
    SET_LOGIN_PASSWORD_FIELD: 'IOTA/UI/SET_LOGIN_PASSWORD_FIELD',
    CLEAR_SEND_FIELDS: 'IOTA/UI/CLEAR_SEND_FIELDS',
    SET_SEND_DENOMINATION: 'IOTA/UI/SET_SEND_DENOMINATION',
    SET_USER_ACTIVITY: 'IOTA/UI/SET_USER_ACTIVITY',
    SET_ONBOARDING_SEED: 'IOTA/UI/SET_ONBOARDING_SEED',
    SET_ONBOARDING_NAME: 'IOTA/UI/SET_ONBOARDING_NAME',
    SET_DO_NOT_MINIMISE: 'IOTA/UI/SET_DO_NOT_MINIMISE',
    TOGGLE_MODAL_ACTIVITY: 'IOTA/UI/TOGGLE_MODAL_ACTIVITY',
    SET_LOGIN_ROUTE: 'IOTA/UI/SET_LOGIN_ROUTE',
    SET_QR_MESSAGE: 'IOTA/UI/SET_QR_MESSAGE',
    SET_QR_AMOUNT: 'IOTA/UI/SET_QR_AMOUNT',
    SET_QR_TAG: 'IOTA/UI/SET_QR_TAG',
    SET_QR_DENOMINATION: 'IOTA/UI/SET_QR_DENOMINATION',
    SET_SELECTED_QR_TAB: 'IOTA/UI/SET_SELECTED_QR_TAB',
    FLIP_RECEIVE_CARD: 'IOTA/UI/FLIP_RECEIVE_CARD',
};

/**
 * Dispatch to set QR message in state
 *
 * @method setQrMessage
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setQrMessage = (payload) => ({
    type: ActionTypes.SET_QR_MESSAGE,
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
    type: ActionTypes.SET_QR_AMOUNT,
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
    type: ActionTypes.SET_QR_TAG,
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
    type: ActionTypes.SET_QR_DENOMINATION,
    payload,
});

/**
 * Dispatch to set selected QR tab on receive screen (mobile)
 *
 * @method setSelectedQrTab
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setSelectedQrTab = (payload) => ({
    type: ActionTypes.SET_SELECTED_QR_TAB,
    payload,
});

/**
 * Dispatch to flip card on receive screen (mobile)
 *
 * @method setSelectedQrTab
 *
 * @returns {{type: {string} }}
 */
export const flipReceiveCard = () => ({
    type: ActionTypes.FLIP_RECEIVE_CARD,
});

/**
 * Dispatch to flip card on receive screen (mobile)
 *
 * @method setSelectedQrTab
 *
 * @returns {{type: {string} }}
 */
export const setSendAddressField = (payload) => ({
    type: ActionTypes.SET_SEND_ADDRESS_FIELD,
    payload,
});

/**
 * Dispatch to set amount field text in state for mobile send screen
 *
 * @method setSendAmountField
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setSendAmountField = (payload) => ({
    type: ActionTypes.SET_SEND_AMOUNT_FIELD,
    payload,
});

/**
 * Dispatch to set message field text in state for mobile send screen
 *
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setSendMessageField = (payload) => ({
    type: ActionTypes.SET_SEND_MESSAGE_FIELD,
    payload,
});

/**
 * Dispatch to set password field text in state for mobile login screen
 *
 * @method setLoginPasswordField
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setLoginPasswordField = (payload) => ({
    type: ActionTypes.SET_LOGIN_PASSWORD_FIELD,
    payload,
});

/**
 * Dispatch to clear text fields on send screen (mobile)
 *
 * @method clearSendFields
 *
 * @returns {{type: {string} }}
 */
export const clearSendFields = () => ({
    type: ActionTypes.CLEAR_SEND_FIELDS,
});

/**
 * Dispatch to set denomination on mobile send screen
 *
 * @method setSendDenomination
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setSendDenomination = (payload) => ({
    type: ActionTypes.SET_SEND_DENOMINATION,
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
    type: ActionTypes.SET_USER_ACTIVITY,
    payload,
});

/**
 * Dispatch to temporarily set generated seed in state during desktop onboarding
 *
 * @method setOnboardingSeed
 *
 * @param {string} seed
 * @param {boolean} isGenerated
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const setOnboardingSeed = (seed, isGenerated) => {
    return {
        type: ActionTypes.SET_ONBOARDING_SEED,
        payload: { seed, isGenerated },
    };
};

/**
 * Dispatch to set account name in state during desktop onboarding
 *
 * @method setOnboardingName
 * @param {string} name
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setOnboardingName = (name) => {
    return {
        type: ActionTypes.SET_ONBOARDING_NAME,
        payload: name,
    };
};

/**
 * Dispatch to disable wallet's active features (when wallet is in a minimised mode)
 *
 * @method setDoNotMinimise
 * @param {boolean} payload
 *
 * @returns {{type: {string}, payload: {boolean} }}
 */
export const setDoNotMinimise = (payload) => {
    return {
        type: ActionTypes.SET_DO_NOT_MINIMISE,
        payload,
    };
};

/**
 * Dispatch to show/hide modal on mobile
 *
 * @method toggleModalActivity
 *
 * @returns {{type: {string} }}
 */
export const toggleModalActivity = () => {
    return {
        type: ActionTypes.TOGGLE_MODAL_ACTIVITY,
    };
};

/**
 * Dispatch to set active child route on mobile login screen
 *
 * @method setLoginRoute
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setLoginRoute = (payload) => {
    return {
        type: ActionTypes.SET_LOGIN_ROUTE,
        payload,
    };
};
