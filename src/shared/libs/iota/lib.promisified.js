import IOTA from 'iota.lib.js';
import Promise from 'bluebird';
import { getQuorumResult, getQuorumNodes } from './quorum';
import { quorum_nodes, use_legacy_quorum } from '../../config';

const PromisifiedIOTA = (...args) => {
    const iota = new IOTA(...args);
    // Can't use Object-Spread here without errors
    // https://github.com/facebook/react-native/issues/5507
    // Object.assign just mutates the original iota object instead
    return Object.assign(iota, {
        api: Promise.promisifyAll(
            use_legacy_quorum
                ? Object.assign(iota.api, {
                      getInclusionStates: (transactions, tips, callback) => {
                          getQuorumResult(
                              (nodeapi, cb) => {
                                  nodeapi.getInclusionStates(transactions, tips, cb);
                              },
                              getQuorumNodes(),
                              1000,
                              false,
                              callback,
                          );
                      },
                      wereAddressesSpentFrom: (addresses, callback) => {
                          getQuorumResult(
                              (nodeapi, cb) => {
                                  nodeapi.wereAddressesSpentFrom(addresses, cb);
                              },
                              getQuorumNodes(),
                              1000,
                              false,
                              callback,
                          );
                      },
                  })
                : iota.api,
        ),
        multisig: Object.assign(iota.multisig, {
            initiateTransferAsync: Promise.promisify(iota.multisig.initiateTransfer),
            addSignatureAsync: Promise.promisify(iota.multisig.addSignature),
        }),
    });
};

export default PromisifiedIOTA;
