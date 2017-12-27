export const ActionTypes = {
    IS_GETTING_SENSITIVE_INFO_REQUEST: 'IOTA/KEYCHAIN/IS_GETTING_SENSITIVE_INFO_REQUEST',
    IS_GETTING_SENSITIVE_INFO_SUCCESS: 'IOTA/KEYCHAIN/IS_GETTING_SENSITIVE_INFO_SUCCESS',
    IS_GETTING_SENSITIVE_INFO_ERROR: 'IOTA/KEYCHAIN/IS_GETTING_SENSITIVE_INFO_ERROR',
};

export const getFromKeychainRequest = (screen, purpose) => ({
    type: ActionTypes.IS_GETTING_SENSITIVE_INFO_REQUEST,
    screen,
    purpose,
});

export const getFromKeychainSuccess = (screen, purpose) => ({
    type: ActionTypes.IS_GETTING_SENSITIVE_INFO_SUCCESS,
    screen,
    purpose,
});

export const getFromKeychainError = (screen, purpose) => ({
    type: ActionTypes.IS_GETTING_SENSITIVE_INFO_ERROR,
    screen,
    purpose,
});
