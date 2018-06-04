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
    TOGGLE_EMPTY_TRANSACTIONS: 'IOTA/UI/TOGGLE_EMPTY_TRANSACTIONS',
};

export const setSendAddressField = (payload) => ({
    type: ActionTypes.SET_SEND_ADDRESS_FIELD,
    payload,
});

export const setSendAmountField = (payload) => ({
    type: ActionTypes.SET_SEND_AMOUNT_FIELD,
    payload,
});

export const setSendMessageField = (payload) => ({
    type: ActionTypes.SET_SEND_MESSAGE_FIELD,
    payload,
});

export const setLoginPasswordField = (payload) => ({
    type: ActionTypes.SET_LOGIN_PASSWORD_FIELD,
    payload,
});

export const clearSendFields = () => ({
    type: ActionTypes.CLEAR_SEND_FIELDS,
});

export const setSendDenomination = (payload) => ({
    type: ActionTypes.SET_SEND_DENOMINATION,
    payload,
});

export const setUserActivity = (payload) => ({
    type: ActionTypes.SET_USER_ACTIVITY,
    payload,
});

export const setOnboardingSeed = (seed, isGenerated) => {
    return {
        type: ActionTypes.SET_ONBOARDING_SEED,
        payload: { seed, isGenerated },
    };
};

export const setOnboardingName = (name) => {
    return {
        type: ActionTypes.SET_ONBOARDING_NAME,
        payload: name,
    };
};

export const setDoNotMinimise = (payload) => {
    return {
        type: ActionTypes.SET_DO_NOT_MINIMISE,
        payload,
    };
};

export const toggleModalActivity = () => {
    return {
        type: ActionTypes.TOGGLE_MODAL_ACTIVITY,
    };
};

export const toggleEmptyTransactions = () => {
    return {
        type: ActionTypes.TOGGLE_EMPTY_TRANSACTIONS,
    };
};

export const setLoginRoute = (payload) => {
    return {
        type: ActionTypes.SET_LOGIN_ROUTE,
        payload,
    };
};
