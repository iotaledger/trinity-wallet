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

const runTask = (type, payload) => {
    return worker.postMessage({
        type,
        payload,
    });
};

export const generateNewAddress = ({
    seed,
    seedName,
    addresses,
}: {
    seed: string,
    addresses: Array<{ balance: number, spent: boolean }>,
    seedName: string,
}) => {
    return runTask('generateNewAddress', {
        seed: seed,
        addresses: addresses,
        seedName,
    });
};
