/* global Electron */
import { changeIotaNode, SwitchingConfig } from 'libs/iota';

import { setSeed } from 'libs/crypto';

import Worker from './main.worker.js';
import store from '../../../shared/store';

// This worker runs inside a web worker, all loaded modules inside the worker
// are in a separate thread, thereby, state changes via the app inside the modules are
// not automatically reflected in the worker.
const worker = new Worker();
export default worker;

worker.onmessage = async ({ data }) => {
    const { type, action } = data;
    const state = store.getState().wallet;
    // dispatch the produced value by the Worker
    // back into the main app store
    switch (type) {
        case 'dispatch':
            store.dispatch(action);
            break;
        // The Worker auto. switched nodes
        case 'updateNode':
            changeIotaNode(action);
            SwitchingConfig.callbacks.forEach((cb) => cb(action));
            break;
        case 'setAdditionalSeed':
            setSeed(state.password, state.additionalAccountName, Electron.getOnboardingSeed());
            Electron.setOnboardingSeed(null);
            break;
    }
};

// send updates to the Redux store to the Worker
store.subscribe(() => {
    worker.postMessage({ type: 'setState', payload: store.getState() });
});

// Runs the given action with its payload inside the Worker
export const runTask = (type, payload) => {
    return worker.postMessage({
        type,
        payload,
    });
};
