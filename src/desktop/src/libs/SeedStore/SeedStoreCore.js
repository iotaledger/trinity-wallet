/* global Electron */
import { iota } from 'libs/iota';
import { performPow } from 'libs/iota/transfers';

export default class SeedStoreCore {
    /**
     * Performs proof-of-works on provided trytes
     *
     * @method performPow
     *
     * @param {array} trytes
     * @param {string} trunkTransaction
     * @param {string} branchTransaction
     * @param {number} minWeightMagnitude
     * @param {boolean} batchedPow
     *
     * @returns {Promise<object>}
     */
    performPow(trytes, trunkTransaction, branchTransaction, minWeightMagnitude, batchedPow) {
        const powFn = Electron.getPowFn(batchedPow);
        return performPow(powFn, this.getDigest, trytes, trunkTransaction, branchTransaction, minWeightMagnitude);
    }

    /**
     * Gets digest for provided trytes
     *
     * @method getDigest
     *
     * @param {string} trytes
     *
     * @returns {Promise<string>}
     */
    getDigest(trytes) {
        return Promise.resolve(iota.utils.transactionObject(trytes).hash);
    }
}
