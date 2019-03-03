import { performPow } from 'shared-modules/libs/iota/transfers';
import { getPowFn, getDigestFn } from '../nativeModules';

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
     * @param {boolean} [batchedPow]
     *
     * @returns {Promise<object>}
     */
    performPow(trytes, trunkTransaction, branchTransaction, minWeightMagnitude, batchedPow = true) {
        return performPow(
            getPowFn(batchedPow),
            this.getDigest,
            trytes,
            trunkTransaction,
            branchTransaction,
            minWeightMagnitude,
            batchedPow,
        );
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
        return getDigestFn()(trytes);
    }
}
