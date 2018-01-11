// import IOTA from 'iota.lib.js';
import IOTA from './iota.lib.promisified';

export const iota = new IOTA({ provider: selectRandomNode() });

export const changeIotaNode = (provider) => iota.changeNode({ provider });

function selectRandomNode() {
    const x = Math.floor(Math.random() * 7);
    const nodes = [
        'https://iri2-api.iota.fm:443',
        'https://iri3-api.iota.fm:443',
        'https://node.tangle.works:443',
        'https://iotanode.us:443',
        'http://astra2261.startdedicated.net:14265',
        'http://iota.nck.nz:14265',
        'http://www.veriti.io',
    ];
    return nodes[x];
}

function listener() {
    let node = store.getStore().getState().settings.fullNode;
    return node.settings.fullNode;
}

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
