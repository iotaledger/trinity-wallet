import map from 'lodash/map';
import { addEntry, addSignatureOrMessage, finalizeBundle } from '@iota/bundle';
import { createBundleMiner, minNormalizedBundle, bundleEssence } from '@iota/bundle-miner/packages/bundle-miner';
import { tritsToTrytes, trytesToTrits, valueToTrits } from '@iota/converter';
import * as Transaction from '@iota/transaction';
import { normalizedBundle, signatureFragments } from '@iota/signing';
import { setCurrentSweepIteration } from '../../actions/sweeps';
import Errors from '../errors';
/* eslint-disable */
import { attachToTangleAsync, getTransactionsToApproveAsync, storeAndBroadcastAsync } from './extendedApi';
import { isBundle } from './transfers';
import { iota } from './index';
import store from '../../store';

/**
 * Creates an unsigned bundle
 *
 * @method createUnsignedBundle
 *
 * @param {Int8Array} outputAddress
 * @param {Int8Array} inputAddress
 * @param {Number} value
 * @param {Number} securityLevel
 *
 * @returns {Int8Array} bundle
 */
export const createUnsignedBundle = (outputAddress, inputAddress, value, securityLevel = 2) => {
    const issuanceTimestamp = valueToTrits(Math.floor(Date.now() / 1000));
    let bundle = new Int8Array();

    bundle = addEntry(bundle, {
        address: outputAddress,
        value: valueToTrits(value),
        issuanceTimestamp,
    });

    // For every security level, create a new zero-value transaction to which you can later add the rest of the signature fragments
    for (let i = 0; i < securityLevel; i++) {
        bundle = addEntry(bundle, {
            address: inputAddress,
            value: valueToTrits(i == 0 ? -value : 0),
            issuanceTimestamp,
        });
    }

    return bundle;
};


/**
 * Sweeps funds
 *
 * @method sweep
 *
 * @param {object} {settings}
 * @param {boolean} withQuorum
 *
 * @returns {function(object, object, string, array): Promise<object>}
 **/
export const sweep = (settings, withQuorum) => (seedStore, input, outputAddress, knownBundleHashes) => {
    const numberOfFragments = 2;

    const unsignedBundle = createUnsignedBundle(
        trytesToTrits(outputAddress),
        trytesToTrits(input.address),
        input.balance,
    );

    const normalizedBundles = map(map(knownBundleHashes, trytesToTrits), normalizedBundle);

    let optimalOutcome = {
        tritSecurityLevel: 0,
    };

    let offset = 0;
    const count = 10 ** 3;
    const offsetTotal = 10 ** 7

    while (offset < offsetTotal) {
        const outcome = createBundleMiner({
            signedNormalizedBundle: minNormalizedBundle(normalizedBundles, numberOfFragments),
            essence: bundleEssence(unsignedBundle),
            numberOfFragments,
            offset,
            count,
        }).start();

        if (outcome.tritSecurityLevel > optimalOutcome.tritSecurityLevel) {
            optimalOutcome = outcome;
        }

        offset += count;
        store.dispatch(setCurrentSweepIteration(offset));
    }

    unsignedBundle.set(valueToTrits(optimalOutcome.index), Transaction.OBSOLETE_TAG_OFFSET);

    const bundle = finalizeBundle(unsignedBundle);

    const cached = {
        transactionObjects: [],
        trytes: [],
    };
    return seedStore
        .getSeed(true)
        .then((seed) => signatureFragments(seed, input.index, numberOfFragments, optimalOutcome.bundle))
        .then((_signatureFragments) => {
            bundle.set(addSignatureOrMessage(bundle, _signatureFragments, 1));

            for (let offset = 0; offset < bundle.length; offset += Transaction.TRANSACTION_LENGTH) {
                cached.trytes.push(tritsToTrytes(bundle.subarray(offset, offset + Transaction.TRANSACTION_LENGTH)));
            }

            const convertToTransactionObjects = (tryteString) => iota.utils.transactionObject(tryteString);
            cached.transactionObjects = map(cached.trytes, convertToTransactionObjects);

            // Check if prepared bundle is valid, especially if its signed correctly.
            if (isBundle(cached.transactionObjects)) {
                return getTransactionsToApproveAsync(settings)();
            }

            throw new Error(Errors.INVALID_BUNDLE);
        })
        .then(({ trunkTransaction, branchTransaction }) => {
            return attachToTangleAsync(settings, seedStore)(trunkTransaction, branchTransaction, cached.trytes);
        })
        .then(({ trytes, transactionObjects }) => {
            cached.trytes = trytes;
            cached.transactionObjects = transactionObjects;

            return Promise.resolve();
            // return storeAndBroadcastAsync(settings)(cached.trytes);
        })
        .then(() => cached);
};
