import { isServerAddressValid } from '../libs/util';

/* eslint-disable import/prefer-default-export */
export const ActionTypes = {
    SET_LOCALE: 'IOTA/SETTINGS/LOCALE',
    SET_FULLNODE: 'IOTA/SETTINGS/FULLNODE',
    ADD_CUSTOM_NODE: 'IOTA/SETTINGS/ADD_CUSTOM_NODE',
};

export function setLocale(locale) {
    return {
        type: ActionTypes.SET_LOCALE,
        payload: locale,
    };
}

export function setFullNode(fullNode) {
    return dispatch => {
        if (!isServerAddressValid(fullNode)) {
            return false;
        }

        dispatch({
            type: ActionTypes.SET_FULLNODE,
            payload: fullNode,
        });

        return true;
    };
}

export function addCustomNode(customNode = '') {
    return (dispatch, getState) => {
        const { settings } = getState();

        if (!isValidServerAddress(customNode)) {
            return false;
        }

        if (settings.availableNodes.includes(customNode)) {
            return false;
        }

        dispatch({
            type: ActionTypes.ADD_CUSTOM_NODE,
            payload: customNode,
        });

        return true;
    };
}
