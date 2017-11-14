import IOTA from 'iota.lib.js';
import Promise from 'bluebird';

const PromisifiedIOTA = (...args) => {
    const iota = new IOTA(...args);
    const promisified = {
        ...iota,
        api: Promise.promisifyAll(iota.api),
        multisig: {
            ...iota.multisig,
            initiateTransferAsync: Promise.promisify(iota.multisig.initiateTransfer),
            addSignatureAsync: Promise.promisify(iota.multisig.addSignature),
        },
    };
    return promisified;
};

export default PromisifiedIOTA;
