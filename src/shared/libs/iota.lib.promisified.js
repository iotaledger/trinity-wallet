import IOTA from 'iota.lib.js';
import Promise from 'bluebird';

const PromisifiedIOTA = (...args) => {
    const iota = new IOTA(...args);
    iota.api = Promise.promisifyAll(iota.api);
    iota.multisig.initiateTransferAsync = Promise.promisify(iota.multisig.initiateTransfer);
    iota.multisig.addSignatureAsync = Promise.promisify(iota.multisig.addSignature);
    return iota;
};

export default PromisifiedIOTA;
