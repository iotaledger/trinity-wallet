export const ActionTypes = {
    SEND_AMOUNT: 'IOTA/APP/WALLET/SEND_AMOUNT',
};

export const sendAmount = (amount, address, message) => {
    const sendDeepLinkObj = {
        amount: amount,
        address: address,
        message: message,
    };
    return {
        type: ActionTypes.SEND_AMOUNT,
        payload: sendDeepLinkObj,
    };
};
