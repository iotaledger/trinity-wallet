import Curl from 'curl.lib.js';
import { iota } from 'libs/iota';

/**
 * Get Proof of Work function
 */
export const getPoWFn = () => {
    Curl.init();

    return (trytes, trunkTransaction, branchTransaction, minWeight) => {
        return trytes.reduce((promise, transactionTrytes, index) => {
            return promise.then((result) => {
                const trunk = !index ? trunkTransaction : result.hashes[index - 1];
                const branch = !index ? branchTransaction : trunkTransaction;
                const updatedTrytes = transactionTrytes
                    .substr(0, 2430)
                    .concat(trunk)
                    .concat(branch)
                    .concat(transactionTrytes.substr(2430, trunk.length + branch.length));

                return Curl.pow({
                    trytes: updatedTrytes,
                    minWeight,
                }).then((nonce) => {
                    const trytesWithNonce = updatedTrytes.substr(0, 2673 - nonce.length).concat(nonce);
                    const transactionObjectWithNonce = iota.utils.transactionObject(trytesWithNonce);

                    result.trytes.push(trytesWithNonce);
                    result.hashes.push(transactionObjectWithNonce.hash);

                    return result;
                });
            });
        }, Promise.resolve({ trytes: [], hashes: [] }));
    };
};
