import 'babel-polyfill';
import {
    generateNewAddress,
    transitionForSnapshot,
    generateAddressesAndGetBalance,
    completeSnapshotTransition,
} from 'actions/wallet';
import {
    getAccountInfo,
    getFullAccountInfoFirstSeed,
    getFullAccountInfoAdditionalSeed,
    manuallySyncAccount,
} from 'actions/accounts';
import { changeIotaNode, SwitchingConfig } from 'libs/iota';
import { defaultNode } from 'config';

let state = {
    settings: {
        node: defaultNode,
        autoNodeSwitching: true,
    },
};

const actions = {
    generateNewAddress,
    getAccountInfo,
    getFullAccountInfoFirstSeed,
    getFullAccountInfoAdditionalSeed,
    manuallySyncAccount,
    transitionForSnapshot,
    generateAddressesAndGetBalance,
    completeSnapshotTransition,
};

// A special dispatch function which either runs
// the given action (if it's a function) or returns the final
// return value to the main app's listener, so that those values
// are applied to the main Redux store.
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

const nodeSwitchedCallback = (newNode) => {
    self.postMessage({
        type: 'updateNode',
        action: newNode,
    });
};

const setAdditionalSeed = () => {
    self.postMessage({
        type: 'setAdditionalSeed',
    });
    return Promise.resolve();
};

// automatically inform the main app, when this instance of
// the iota library automatically changed node
SwitchingConfig.callbacks.push(nodeSwitchedCallback);

const getState = () => {
    return state;
};

// Listen for new messages to process
self.onmessage = ({ data }) => {
    const { type, payload } = data;

    if (type === 'setState') {
        if (state.settings.node !== payload.settings.node) {
            changeIotaNode(payload.settings.node);
        }
        if (SwitchingConfig.autoSwitch !== payload.settings.autoNodeSwitching) {
            SwitchingConfig.autoSwitch = payload.settings.autoNodeSwitching;
        }
        state = payload;
    } else {
        // Attach custom callback for adding additional seed
        if (type === 'getFullAccountInfoAdditionalSeed') {
            actions[type](...payload, setAdditionalSeed)(dispatch, getState);
        } else if (typeof actions[type] === 'function') {
            actions[type](...payload)(dispatch, getState);
        }
    }
};
