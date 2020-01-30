import map from 'lodash/map';
import { addEntry, addSignatureOrMessage, finalizeBundle } from '@iota/bundle';
import { minNormalizedBundle, bundleEssence } from '@iota/bundle-miner/packages/bundle-miner';
import { tritsToTrytes, trytesToTrits, valueToTrits } from '@iota/converter';
import * as Transaction from '@iota/transaction';
import { normalizedBundle, signatureFragments } from '@iota/signing';
import Errors from '../errors';
import { attachToTangleAsync, getTransactionsToApproveAsync, storeAndBroadcastAsync } from './extendedApi';
import { isBundle } from './transfers';
import { iota } from './index';

/**
 * Creates an unsigned bundle
 *
 * @method createUnsignedBundle
 *
 * @param {Int8Array} outputAddress
 * @param {Int8Array} inputAddress
 * @param {Number} value
 * @param {Number} issuanceTimestamp
 * @param {Number} securityLevel
 *
 * @returns {Int8Array} bundle
 */
export const createUnsignedBundle = (outputAddress, inputAddress, value, timestamp, securityLevel = 2) => {
    let bundle = new Int8Array();
    const issuanceTimestamp = valueToTrits(timestamp);

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
 * @returns {function(string, object, object, string, array): Promise<object>}
 **/
export const sweep = (settings) => (accountType, seedStore, input, outputAddress, knownBundleHashes) => {
    const security = 2;

    const now = Date.now();

    const issuanceTimestamp = Math.floor(now / 1000);

    const convertToTransactionObjects = (tryteString) => iota.utils.transactionObject(tryteString);

    const unsignedBundle = createUnsignedBundle(
        trytesToTrits(outputAddress),
        trytesToTrits(input.address),
        input.balance,
        issuanceTimestamp,
    );

    const normalizedBundles = map(map(knownBundleHashes, trytesToTrits), normalizedBundle);

    const cached = {
        transactionObjects: [],
        trytes: [],
    };

    const isLedgerAccount = accountType === 'ledger';

    return seedStore
        .mineBundle(minNormalizedBundle(normalizedBundles, security), bundleEssence(unsignedBundle), isLedgerAccount)
        .then((index) => {
            if (isLedgerAccount) {
                const transfers = [
                    {
                        address: outputAddress,
                        value: input.balance,
                        tag: tritsToTrytes(valueToTrits(index)),
                    },
                ];

                const inputs = [
                    {
                        address: input.address,
                        balance: input.balance,
                        keyIndex: input.index,
                    },
                ];

                return seedStore
                    .prepareTransfers(settings)(transfers, { inputs }, () => now)
                    .then((trytes) => {
                        cached.trytes = trytes;
                        cached.transactionObjects = map(cached.trytes, convertToTransactionObjects);

                        // Check if prepared bundle is valid, especially if its signed correctly.
                        if (isBundle(cached.transactionObjects)) {
                            return getTransactionsToApproveAsync(settings)();
                        }

                        throw new Error(Errors.INVALID_BUNDLE);
                    });
            }

            unsignedBundle.set(valueToTrits(index), Transaction.OBSOLETE_TAG_OFFSET);

            // Finalize bundle
            const bundle = finalizeBundle(unsignedBundle, security);

            return seedStore
                .getSeed(true)
                .then((seed) => {
                    return signatureFragments(seed, input.index, security, Transaction.bundle(bundle));
                })
                .then((_signatureFragments) => {
                    bundle.set(addSignatureOrMessage(bundle, _signatureFragments, 1));

                    for (let offset = 0; offset < bundle.length; offset += Transaction.TRANSACTION_LENGTH) {
                        cached.trytes.push(
                            tritsToTrytes(bundle.subarray(offset, offset + Transaction.TRANSACTION_LENGTH)),
                        );
                    }

                    cached.transactionObjects = map(cached.trytes, convertToTransactionObjects);

                    // Check if prepared bundle is valid, especially if its signed correctly.
                    if (isBundle(cached.transactionObjects)) {
                        return getTransactionsToApproveAsync(settings)();
                    }

                    throw new Error(Errors.INVALID_BUNDLE);
                });
        })
        .then(({ trunkTransaction, branchTransaction }) => {
            return attachToTangleAsync(settings, seedStore)(trunkTransaction, branchTransaction, cached.trytes);
        })
        .then(({ trytes, transactionObjects }) => {
            cached.trytes = trytes;
            cached.transactionObjects = transactionObjects;

            return storeAndBroadcastAsync(settings)(cached.trytes);
        })
        .then(() => cached);
};
