import IOTA from 'iota.lib.js';

const defaultNode = 'http://bahamapascal-tn1.ddns.net:14200';

export const iota = new IOTA({
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
