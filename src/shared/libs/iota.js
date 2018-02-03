import IOTA from './iota.lib.promisified';
import { defaultNode, nodes } from '../config';

export const iota = new IOTA({ provider: defaultNode });

export const changeIotaNode = provider => iota.changeNode({ provider });

export const getRandomNode = () => {
    const x = Math.floor(Math.random() * nodes.length);

    return nodes[x];
};

export const convertFromTrytes = trytes => {
    trytes = trytes.replace(/9+$/, '');
    const message = iota.utils.fromTrytes(trytes);
    if (trytes === '') {
        return 'Empty';
    }
    return message;
};

export const getBalances = addresses => {
    iota.api.getBalances(addresses, 1, (error, success) => {
        if (!error) {
            console.log(success);
        } else {
            console.log(error);
        }
    });
};

export const checkNode = cb => {
    iota.api.getNodeInfo((error, success) => {
        if (error) {
            cb(error);
            console.log(error);
        } else {
            cb(null, success);
        }
    });
};

export const getChecksum = seed => {
    return iota.utils.addChecksum(seed, 3, false).substr(-3);
};

export const isReceivedTransfer = (bundle, addresses) => {
    // Iterate over every bundle entry

    for (let i = 0; i < bundle.length; i++) {
        if (addresses.indexOf(bundle[i].address) > -1) {
            // Check if it's a remainder address
            const isRemainder = bundle[i].currentIndex === bundle[i].lastIndex && bundle[i].lastIndex !== 0;
            // check if sent transaction
            if (bundle[i].value < 0 && !isRemainder) {
                return false;
                // check if received transaction, or 0 value (message)
            } else if (bundle[i].value >= 0 && !isRemainder) {
                return true;
            }
        }
    }
};
