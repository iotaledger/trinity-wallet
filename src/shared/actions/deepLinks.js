export const ActionTypes = {
    SEND_AMOUNT: 'IOTA/APP/WALLET/SEND_AMOUNT',
};

export const sendAmount = amount => {
    return {type: ActionTypes.SEND_AMOUNT,
    payload: amount
    };
};

