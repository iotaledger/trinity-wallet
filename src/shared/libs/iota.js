import IOTA from './iota.lib.promisified';
import { defaultNode, nodes } from '../config';

export const iota = new IOTA({ provider: defaultNode });

export const changeIotaNode = (provider) => iota.changeNode({ provider });

export const getRandomNode = () => {
    const x = Math.floor(Math.random() * nodes.length);

    return nodes[x];
};

export const convertFromTrytes = (trytes) => {
    trytes = trytes.replace(/9+$/, '');
    const message = iota.utils.fromTrytes(trytes);
    if (trytes === '') {
        return 'Empty';
    }
    return message;
};

export const getBalances = (addresses) => {
    iota.api.getBalances(addresses, 1, (error, success) => {
        if (!error) {
            console.log(success);
        } else {
            console.log(error);
        }
    });
};

export const checkNode = (cb) => {
    iota.api.getNodeInfo((error, success) => {
        if (error) {
            cb(error);
            console.log(error);
        } else {
            cb(null, success);
        }
    });
};

export const getChecksum = (seed) => {
    return iota.utils.addChecksum(seed, 3, false).substr(-3);
};
