import Worker from './main.worker.js';
import store from '../../../shared/store';

const worker = new Worker();
export default worker;

worker.onmessage = ({ data }) => {
    const { type, action } = data;

    if (type === 'dispatch') {
        store.dispatch(action);
    }
};

store.subscribe(() => worker.postMessage({ type: 'setState', payload: store.getState() }));

export const runTask = (type, payload) => {
    return worker.postMessage({
        type,
        payload,
    });
};
