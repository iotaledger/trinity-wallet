export const ActionTypes = {
    SET_SEND_ADDRESS_FIELD: 'IOTA/UI/SET_SEND_ADDRESS_FIELD',
    SET_SEND_AMOUNT_FIELD: 'IOTA/UI/SET_SEND_AMOUNT_FIELD',
    SET_SEND_MESSAGE_FIELD: 'IOTA/UI/SET_SEND_MESSAGE_FIELD',
    SET_LOGIN_PASSWORD_FIELD: 'IOTA/UI/SET_LOGIN_PASSWORD_FIELD',
    CLEAR_SEND_FIELDS: 'IOTA/UI/CLEAR_SEND_FIELDS',
    SET_SEND_DENOMINATION: 'IOTA/UI/SET_SEND_DENOMINATION',
    SET_USER_ACTIVITY: 'IOTA/UI/SET_USER_ACTIVITY',
    SET_ONBOARDING_SEED: 'IOTA/UI/SET_ONBOARDING_SEED',
    SET_DO_NOT_MINIMISE: 'IOTA/UI/SET_DO_NOT_MINIMISE',
    TOGGLE_MODAL_ACTIVITY: 'IOTA/UI/TOGGLE_MODAL_ACTIVITY',
    UPDATE_MODAL_PROPS: 'IOTA/UI/UPDATE_MODAL_PROPS',
    SET_LOGIN_ROUTE: 'IOTA/UI/SET_LOGIN_ROUTE',
    SET_QR_MESSAGE: 'IOTA/UI/SET_QR_MESSAGE',
    SET_QR_AMOUNT: 'IOTA/UI/SET_QR_AMOUNT',
    SET_QR_TAG: 'IOTA/UI/SET_QR_TAG',
    SET_QR_DENOMINATION: 'IOTA/UI/SET_QR_DENOMINATION',
    SET_SELECTED_QR_TAB: 'IOTA/UI/SET_SELECTED_QR_TAB',
    FLIP_RECEIVE_CARD: 'IOTA/UI/FLIP_RECEIVE_CARD',
    SET_ROUTE: 'IOTA/UI/SET_ROUTE',
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
 * Dispatch to set selected QR tab on receive page (mobile)
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
 * Dispatch to flip card on receive page (mobile)
 *
 * @method setSelectedQrTab
 *
 * @returns {{type: {string} }}
 */
export const flipReceiveCard = () => ({
    type: ActionTypes.FLIP_RECEIVE_CARD,
});

/**
 * Dispatch to set address field text on send page (mobile)
 *
 * @method setSendAddressField
 *
 * @returns {{type: {string} }}
 */
export const setSendAddressField = (payload) => ({
    type: ActionTypes.SET_SEND_ADDRESS_FIELD,
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
    type: ActionTypes.SET_SEND_AMOUNT_FIELD,
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
    type: ActionTypes.SET_SEND_MESSAGE_FIELD,
    payload,
});

/**
 * Dispatch to set password field text on login page (mobile)
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
 * Dispatch to clear text fields on send page (mobile)
 *
 * @method clearSendFields
 *
 * @returns {{type: {string} }}
 */
export const clearSendFields = () => ({
    type: ActionTypes.CLEAR_SEND_FIELDS,
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
 * Dispatch to temporarily set generated seed in state during mobile onboarding
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
 * Dispatch to disable wallet's active features (when app is minimised)
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
 * @returns {{type: {string}, modalContent: {string}, modalProps: {object} }}
 */
export const toggleModalActivity = (modalContent, modalProps) => {
    return {
        type: ActionTypes.TOGGLE_MODAL_ACTIVITY,
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
        type: ActionTypes.UPDATE_MODAL_PROPS,
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
        type: ActionTypes.SET_LOGIN_ROUTE,
        payload,
    };
};

/**
 * Dispatch to set active route
 *
 * @method setRoute
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setRoute = (payload) => {
    return {
        type: ActionTypes.SET_ROUTE,
        payload,
    };
};
