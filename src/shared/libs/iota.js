import IOTA from 'iota.lib.js';

const defaultNode = 'https://node.tangle.works:443';

export var iota = new IOTA({
    provider: defaultNode,
});

export const convertFromTrytes = trytes => {
    trytes = trytes.replace(/9+$/, '');
    var message = iota.utils.fromTrytes(trytes);
    if (trytes == '') {
        return 'Empty';
    } else {
        return message;
    }
};
