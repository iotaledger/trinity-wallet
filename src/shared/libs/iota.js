import IOTA from 'iota.lib.js';
import { defaultNode } from '../config';

export const iota = new IOTA({ provider: defaultNode });

export const changeIotaNode = provider => iota.changeNode({ provider });

function listener() {
    let node = store.getStore().getState().settings.fullNode;
    return node.settings.fullNode;
}

export const convertFromTrytes = trytes => {
    trytes = trytes.replace(/9+$/, '');
    var message = iota.utils.fromTrytes(trytes);
    if (trytes == '') {
        return 'Empty';
    } else {
        return message;
    }
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
