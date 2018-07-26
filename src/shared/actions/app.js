export const ActionTypes = {
    SET_ACTIVATION_CODE: 'IOTA/APP/SET_ACTIVATION_CODE',
};

/**
 * Dispatch to set activation code for desktop
 *
 * @method setActivationCode
 * @param {string} code
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setActivationCode = (code) => ({
    type: ActionTypes.SET_ACTIVATION_CODE,
    payload: code,
});
