/* eslint-disable import/prefer-default-export */
export const ActionTypes = {
    SET_LOCALE: 'IOTA/SETTINGS/LOCALE',
    SET_FULLNODE: 'IOTA/SETTINGS/FULLNODE',
};

export function setLocale(locale) {
    return {
        type: ActionTypes.SET_LOCALE,
        payload: locale,
    };
}

export function setFullNode(fullNode) {
    return {
        type: ActionTypes.SET_FULLNODE,
        payload: fullNode,
    };
}
