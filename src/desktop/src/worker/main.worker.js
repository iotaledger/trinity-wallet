import 'babel-polyfill';
import { generateNewAddress } from 'actions/tempAccount';
import { getAccountInfo, getFullAccountInfo, fetchFullAccountInfoForFirstUse } from 'actions/account';

let state = {};

const actions = {
    generateNewAddress,
    getAccountInfo,
    getFullAccountInfo,
    fetchFullAccountInfoForFirstUse,
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
            state = payload;
            break;
        default:
            if (typeof actions[type] === 'function') {
                actions[type](...payload)(dispatch, getState);
            }
    }
};
