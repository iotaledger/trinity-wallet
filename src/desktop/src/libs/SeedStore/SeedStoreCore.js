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
     * @param {Int8Array} bundleEssence
     * @param {boolean} isLedgerAccount
     * @param {number} [security]
     * @param {number} [essenceLength]
     * @param {number} [count]
     * @param {number} [procs]
     * @param {number} [miningThreshold]
     *
     * @returns {Promise<number>}
     */
    mineBundle(
        normalizedBundle,
        bundleEssence,
        isLedgerAccount,
        security = 2,
        essenceLength = 486 * 3,
        count = 10 ** 8,
        procs = 0,
        miningThreshold = 40,
    ) {
        return Electron.getBundleMinerFn()(
            Array.from(normalizedBundle),
            security,
            Array.from(bundleEssence),
            essenceLength,
            isLedgerAccount ? count * 3.13 : count,
            procs,
            miningThreshold,
            isLedgerAccount ? 1 : 0,
        );
    }
}
