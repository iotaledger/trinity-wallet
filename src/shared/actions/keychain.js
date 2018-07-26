export const ActionTypes = {
    IS_GETTING_SENSITIVE_INFO_REQUEST: 'IOTA/KEYCHAIN/IS_GETTING_SENSITIVE_INFO_REQUEST',
    IS_GETTING_SENSITIVE_INFO_SUCCESS: 'IOTA/KEYCHAIN/IS_GETTING_SENSITIVE_INFO_SUCCESS',
    IS_GETTING_SENSITIVE_INFO_ERROR: 'IOTA/KEYCHAIN/IS_GETTING_SENSITIVE_INFO_ERROR',
};

/**
 * Dispatch when a request to access keychain is about to be made on mobile
 *
 * @method getFromKeychainRequest
 * @param {string} screen
 * @param {string} purpose
 *
 * @returns {{type: {string}, screen: {string}, purpose: {string} }}
 */
export const getFromKeychainRequest = (screen, purpose) => ({
    type: ActionTypes.IS_GETTING_SENSITIVE_INFO_REQUEST,
    screen,
    purpose,
});

/**
 * Dispatch when keychain data is successfully accessed on mobile
 *
 * @method getFromKeychainSuccess
 * @param {string} screen
 * @param {string} purpose
 *
 * @returns {{type: {string}, screen: {string}, purpose: {string} }}
 */
export const getFromKeychainSuccess = (screen, purpose) => ({
    type: ActionTypes.IS_GETTING_SENSITIVE_INFO_SUCCESS,
    screen,
    purpose,
});

/**
 * Dispatch when an error occurs during keychain access on mobile
 *
 * @method getFromKeychainError
 * @param {string} screen
 * @param {string} purpose
 *
 * @returns {{type: {string}, screen: {string}, purpose: {string} }}
 */
export const getFromKeychainError = (screen, purpose) => ({
    type: ActionTypes.IS_GETTING_SENSITIVE_INFO_ERROR,
    screen,
    purpose,
});
