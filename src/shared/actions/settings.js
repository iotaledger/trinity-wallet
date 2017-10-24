import { isValidServerAddress } from '../libs/util';
import { showError } from './notifications';

export const ActionTypes = {
    SET_LOCALE: 'IOTA/SETTINGS/LOCALE',
    SET_FULLNODE: 'IOTA/SETTINGS/FULLNODE',
    ADD_CUSTOM_NODE: 'IOTA/SETTINGS/ADD_CUSTOM_NODE',
    SET_MODE: 'IOTA/SETTINGS/SET_MODE',
    SET_THEME: 'IOTA/SETTINGS/SET_THEME',
    SET_LANGUAGE: 'IOTA/SETTINGS/SET_LANGUAGE',
};

export function setLocale(locale) {
    return {
        type: ActionTypes.SET_LOCALE,
        payload: locale,
    };
}

export const invalidServerError = () => {
    return showError({
        title: 'invalidServer_title',
        text: 'invalidServer_text',
        translate: true,
    });
};

export function setFullNode(fullNode) {
    return dispatch => {
        if (!isValidServerAddress(fullNode)) {
            dispatch(invalidServerError());
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
            dispatch(invalidServerError());
            return false;
        }

        if (settings.availableNodes.includes(customNode)) {
            return true;
        }

        dispatch({
            type: ActionTypes.ADD_CUSTOM_NODE,
            payload: customNode,
        });

        return true;
    };
}
