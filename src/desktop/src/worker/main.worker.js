import 'babel-polyfill';
import { generateNewAddress } from 'actions/tempAccount';
import { getAccountInfo, getFullAccountInfoFirstSeed, getFullAccountInfoAdditionalSeed } from 'actions/account';
import { changeIotaNode } from 'libs/iota';
import { defaultNode } from 'config';

let state = {
    settings: {
        fullNode: defaultNode,
    },
};

const actions = {
    generateNewAddress,
    getAccountInfo,
    getFullAccountInfoFirstSeed,
    getFullAccountInfoAdditionalSeed,
};

const dispatch = (action) => {
    if (typeof action === 'function') {
        action(dispatch, getState);
    } else {
        self.postMessage({
            type: 'dispatch',
            action,
        });
    }
};

const getState = () => {
    return state;
};

self.onmessage = ({ data }) => {
    const { type, payload } = data;

    switch (type) {
        case 'setState':
            if (state.settings.fullNode !== payload.settings.fullNode) {
                changeIotaNode(payload.settings.fullNode);
            }
            state = payload;
            break;
        default:
            if (typeof actions[type] === 'function') {
                actions[type](...payload)(dispatch, getState);
            }
    }
};
