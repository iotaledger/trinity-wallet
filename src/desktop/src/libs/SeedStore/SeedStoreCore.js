/* global Electron */
import { iota } from 'libs/iota';
import { performPow } from 'libs/iota/transfers';
import { createBundleMiner } from '@iota/bundle-miner/packages/bundle-miner';

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
    performPow(trytes, trunkTransaction, branchTransaction, minWeightMagnitude, batchedPow = true) {
        const powFn = Electron.getPowFn(batchedPow);
        return performPow(
            powFn,
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
        return Promise.resolve(iota.utils.transactionObject(trytes).hash);
    }

    /**
     * Mines bundle
     *
     * @method mineBundle
     *
     * @param {Int8Array} normalizedBundle
     * @param {number} numberOfFragments
     * @param {Int8Array} bundleEssence
     * @param {number} [essenceLength]
     * @param {number} [count]
     * @param {number} [procs]
     *
     * @returns {Promise<number>}
     */
    mineBundle(
        normalizedBundle,
        numberOfFragments,
        bundleEssence,
        /* eslint-disable no-unused-vars */
        essenceLength = 486 * 4,
        count = 10 ** 3,
        procs = 0,
        /* eslint-enable no-unused-vars */
    ) {
        // TODO: Replace this method with entangled native method
        const result = createBundleMiner({
            signedNormalizedBundle: normalizedBundle,
            essence: bundleEssence,
            numberOfFragments,
            offset: 0,
            count,
        }).start();

        return Promise.resolve(result.index);
    }
}
