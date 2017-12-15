import IOTA from 'iota.lib.js';
import Promise from 'bluebird';

const PromisifiedIOTA = (...args) => {
    const iota = new IOTA(...args);
    // Can't use Object-Spread here without errors
    // https://github.com/facebook/react-native/issues/5507
    // Object.assign just mutates the original iota object instead
    return Object.assign(iota, {
        api: Promise.promisifyAll(iota.api),
        multisig: Object.assign(iota.multisig, {
            initiateTransferAsync: Promise.promisify(iota.multisig.initiateTransfer),
            addSignatureAsync: Promise.promisify(iota.multisig.addSignature),
        }),
    });
};

export default PromisifiedIOTA;
