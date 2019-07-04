import assign from 'lodash/assign';
import every from 'lodash/every';
import filter from 'lodash/filter';
import isEmpty from 'lodash/isEmpty';
import flatMap from 'lodash/flatMap';
import omitBy from 'lodash/omitBy';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import some from 'lodash/some';
import uniqBy from 'lodash/uniqBy';
import {
    attachToTangleAsync,
    getTransactionsToApproveAsync,
    prepareTransfersAsync,
    storeAndBroadcastAsync,
    getBalancesAsync,
    findTransactionObjectsAsync,
    getLatestInclusionAsync,
    wereAddressesSpentFromAsync,
} from './extendedApi';
import { iota } from './index';
import Errors from '../errors';
import { isValidInput } from './inputs';
import {
    isValidTransfer,
    constructBundle,
    categoriseInclusionStatesByBundleHash,
    promoteTransactionTilConfirmed,
    isFundedBundle,
    isBundle,
} from './transfers';
import { accumulateBalance } from './addresses';

/**
 * Sweeps funds
 *
 * @method sweep
 *
 * @param {object} {settings}
 * @param {boolean} seedStore
 *
 * @returns {function(object, string, object, object): Promise<object>}
 **/
const sweep = (settings, withQuorum) => (seedStore, seed, input, transfer) => {
    if (!isValidInput(input)) {
        return Promise.reject(new Error(Errors.INVALID_INPUT));
    }

    if (!isValidTransfer(transfer)) {
        return Promise.reject(new Error(Errors.INVALID_TRANSFER));
    }

    const validInput = assign({}, input, { address: iota.utils.noChecksum(input.address) });
    const validTransfer = assign({}, transfer, { address: iota.utils.noChecksum(transfer.address) });

    if (validInput.address === validTransfer.address) {
        return Promise.reject(new Error(Errors.CANNOT_SWEEP_TO_SAME_ADDRESS));
    }

    const cached = {
        transactionObjects: [],
        trytes: [],
    };

    // Before proceeding make sure:
    //  - Latest balance hasn't changed
    //  - We don't require a remainder transaction
    return getBalancesAsync(settings, withQuorum)([validInput.address])
        .then((balances) => {
            const latestBalance = accumulateBalance(map(balances.balances, Number));

            if (latestBalance === validInput.balance && latestBalance === validTransfer.value) {
                // Check if there are any transactions for both input & recipient address
                return findTransactionObjectsAsync(settings)({
                    addresses: [validInput.address, validTransfer.address],
                });
            }

            throw new Error(Errors.BALANCE_MISMATCH);
        })
        .then((transactionFromAddresses) => {
            // Only keep value transactions
            const valueTransactions = filter(transactionFromAddresses, (tx) => tx.value !== 0);

            // if there are no value transactions, validate spend statuses
            if (isEmpty(valueTransactions)) {
                // Check both recipient & input addresses
                return wereAddressesSpentFromAsync(settings, withQuorum)([validInput.address, validTransfer.address]);
            }

            // If there are value transactions:
            //  - Construct bundles
            //  - Validate bundles
            //  - Check if any transaction (from valid bundles) is still pending
            return findTransactionObjectsAsync(settings)({
                bundles: map(uniqBy(valueTransactions, 'bundle'), (tx) => tx.bundle),
            }).then((transactionsFromBundles) => {
                // Also keep reattachments
                const validBundles = filter(
                    map(filter(transactionsFromBundles, (tx) => tx.currentIndex === 0), (tailTransaction) =>
                        constructBundle(tailTransaction, transactionsFromBundles),
                    ),
                    isBundle,
                );

                if (isEmpty(validBundles)) {
                    // Check both recipient & input addresses
                    return wereAddressesSpentFromAsync(settings, withQuorum)([
                        validInput.address,
                        validTransfer.address,
                    ]);
                }

                return reduce(
                    validBundles,
                    (promise, bundle) => {
                        return promise.then((result) => {
                            return isFundedBundle(settings, withQuorum)(bundle).then((isFunded) => {
                                if (isFunded) {
                                    return [...result, bundle];
                                }

                                return result;
                            });
                        });
                    },
                    Promise.resolve([]),
                ).then((fundedBundles) => {
                    const transactions = flatMap(fundedBundles, (bundle) => bundle);
                    // Check both recipient & input addresses
                    const checkSpendStatuses = () =>
                        wereAddressesSpentFromAsync(settings, withQuorum)([validInput.address, validTransfer.address]);

                    if (isEmpty(transactions)) {
                        return checkSpendStatuses();
                    } else if (
                        // An extra check to see if there is any transaction that spends from input address or recipient address
                        some(
                            transactions,
                            (tx) =>
                                // Check if there is any outgoing transaction from input address
                                (tx.address === validInput.address && tx.value < 0) ||
                                // Check if there is any outgoing transaction from recipient address
                                (tx.address === validTransfer.address && tx.value < 0),
                        )
                    ) {
                        throw new Error(Errors.ALREADY_SPENT_FROM_ADDRESSES);
                    }

                    const tailTransactions = filter(transactions, (tx) => tx.currentIndex === 0);

                    // Check confirmation states
                    return getLatestInclusionAsync(settings)(map(tailTransactions, (tx) => tx.hash)).then((states) => {
                        const statesByBundleHash = categoriseInclusionStatesByBundleHash(tailTransactions, states);

                        // Check if there is no pending transaction on input or recipient address
                        if (!isEmpty(statesByBundleHash) && every(statesByBundleHash, (state) => state === true)) {
                            return checkSpendStatuses();
                        }

                        // At this point, there could be two cases:
                        //   1- Input address has pending transactions
                        //   2- Recipient address has pending transactions
                        // For both cases, make the transaction confirmed by promoting/reattaching before proceeding
                        return reduce(
                            map(omitBy(statesByBundleHash, (state) => state === true), (_, bundleHash) =>
                                filter(tailTransactions, (tx) => tx.bundle === bundleHash),
                            ),
                            (promise, txs) => {
                                return promise.then(() => promoteTransactionTilConfirmed(settings, seedStore)(txs));
                            },
                            Promise.resolve({}),
                        ).then(() => checkSpendStatuses());
                    });
                });
            });
        })
        .then((spendStatuses) => {
            // Check if both input & receive address are unspent
            if (!isEmpty(spendStatuses) && every(spendStatuses, (status) => status === false)) {
                // Prepare bundle, sign inputs
                return prepareTransfersAsync(settings)(seed, [validTransfer], { inputs: [validInput] });
            }

            throw new Error(Errors.ALREADY_SPENT_FROM_ADDRESSES);
        })
        .then((trytes) => {
            cached.trytes = trytes;

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

            return storeAndBroadcastAsync(settings)(cached.trytes);
        })
        .then(() => cached);
};

export default sweep;
