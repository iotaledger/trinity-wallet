import { setSeed } from 'libs/crypto';
import Worker from './main.worker.js';
import store from '../../../shared/store';

const worker = new Worker();
export default worker;

worker.onmessage = async ({ data }) => {
    const { type, action, payload } = data;
    switch (type) {
        case 'dispatch':
            store.dispatch(action);
            break;
        case 'saveSeed':
            setSeed(payload.password, payload.seed);
            break;
    }
};

store.subscribe(() => worker.postMessage({ type: 'setState', payload: store.getState() }));

export const runTask = (type, payload) => {
    return worker.postMessage({
        type,
        payload,
    });
};
