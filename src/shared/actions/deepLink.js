export const ActionTypes = {
    SET_DEEP_LINK: 'IOTA/APP/WALLET/SET_DEEP_LINK',
};

export const setDeepLink = (amount, address, message) => {
    return {
        type: ActionTypes.SET_DEEP_LINK,
        amount,
        address,
        message,
    };
};
