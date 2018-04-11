export const ActionTypes = {
    SET_DEEP_LINK: 'IOTA/APP/WALLET/SET_DEEP_LINK',
    SET_DEEP_LINK_INACTIVE: 'IOTA/APP/WALLET/SET_DEEP_LINK_INACTIVE',
};

export const setDeepLink = (amount, address, message) => {
    return {
        type: ActionTypes.SET_DEEP_LINK,
        amount,
        address,
        message,
    };
};

export const setDeepLinkInactive = () => {
    return {
        type: ActionTypes.SET_DEEP_LINK_INACTIVE,
    };
};
