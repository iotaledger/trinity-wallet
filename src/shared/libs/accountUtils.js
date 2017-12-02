import each from 'lodash/each';
import size from 'lodash/size';
import head from 'lodash/head';
import get from 'lodash/get';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import some from 'lodash/some';

export const formatAddressBalances = (addresses, balances) => {
    var addressesWithBalance = Object.assign({}, ...addresses.map((n, index) => ({ [n]: balances[index] })));
    return addressesWithBalance;
};

export const formatAddressBalancesNewSeed = data => {
    var addresses = data.addresses;
    var addressesWithBalance = Object.assign({}, ...addresses.map(n => ({ [n]: 0 })));
    for (var i = 0; i < data.inputs.length; i++) {
        addressesWithBalance[data.inputs[i].address] = data.inputs[i].balance;
    }
    return addressesWithBalance;
};

export const groupTransfersByBundle = transfers => {
    let groupedTransfers = [];
    transfers.forEach(tx => {
        if (!groupedTransfers.length) {
            groupedTransfers.push([tx]);
        } else {
            const i = groupedTransfers.findIndex(bundle => bundle[0].bundle === tx.bundle);
            if (i !== -1) {
                const groupedRow = groupedTransfers[i];

                for (let j = size(groupedRow); j--; ) {
                    const transfer = groupedRow[j];
                    if (get(tx, 'currentIndex') === get(transfer, 'currentIndex')) {
                        if (get(tx, 'attachmentTimestamp') > get(transfer, 'attachmentTimestamp')) {
                            groupedTransfers[i][j] = tx;
                        }
                        break;
                    } else {
                        if (j === 0) {
                            groupedTransfers[i].push(tx); // Would break the loop anyways
                        }
                    }
                }
            } else {
                groupedTransfers.push([tx]);
            }
        }
    });
    // Order arrays of transfer object(s) by currentIndex
    groupedTransfers.forEach(arr => {
        arr.sort(function(a, b) {
            return a.currentIndex - b.currentIndex;
        });
    });
    return groupedTransfers;
};
export const formatTransfers = (transfers, addresses) => {
    // Order transfers from oldest to newest
    let sortedTransfers = transfers.sort((a, b) => {
        if (a[0].timestamp > b[0].timestamp) {
            return -1;
        }
        if (a[0].timestamp < b[0].timestamp) {
            return 1;
        }
        return 0;
    });

    // add transaction values to transactions
    sortedTransfers = addTransferValues(sortedTransfers, addresses);
    return sortedTransfers;
};

export const addTransferValues = (transfers, addresses) => {
    // Add transaction value property to each transaction object
    // FIXME: We should never mutate parameters at any level.
    return transfers.map(arr => {
        /* eslint-disable no-param-reassign */
        arr[0].transferValue = 0;
        arr.map(obj => {
            if (addresses.includes(obj.address)) {
                arr[0].transferValue += obj.value;
            }

            /* eslint-enable no-param-reassign */
            return obj;
        });

        return arr;
    });
};

export const calculateBalance = data => {
    let balance = 0;
    if (Object.keys(data).length > 0) {
        balance = Object.values(data).reduce((a, b) => a + b);
    }
    return balance;
};

export const getIndexesWithBalanceChange = (a, b) => {
    let indexes = [];
    for (var i = 0; i < a.length; i++) {
        if (a[i] != b[i]) {
            indexes.push(i);
        }
    }
    return indexes;
};

export const getAddressesWithChangedBalance = (allAddresses, indicesWithChangedBalance) => {
    const addressesWithChangedBalance = [];

    each(indicesWithChangedBalance, idx => {
        if (allAddresses[idx]) {
            addressesWithChangedBalance.push(allAddresses[idx]);
        }
    });

    return addressesWithChangedBalance;
};

export const mergeLatestTransfersInOld = (oldTransfers, latestTransfers) => {
    let old = oldTransfers.slice(0);
    let latest = latestTransfers.slice(0);

    const maxOldTransfers = size(old);
    const maxLatestTransfers = size(latest);

    for (let i = maxLatestTransfers; i--; ) {
        const latestTxTop = head(latest[i]);
        const latestTxBundle = get(latestTxTop, 'bundle');
        for (let j = maxOldTransfers; j--; ) {
            const oldTxTop = head(old[j]);
            const oldTxBundle = get(oldTxTop, 'bundle');
            if (oldTxBundle === latestTxBundle) {
                old[j] = latest[i];
                latest.splice(i, 1);
            }
        }
    }

    return size(latest) ? [...old, ...latest] : old;
};

export const deduplicateBundles = transfers => {
    const deduplicate = (res, transfer) => {
        const top = transfer[0];
        const bundle = top.bundle;
        const attachmentTimestamp = top.attachmentTimestamp;

        if (get(res, bundle)) {
            const timestampOnExistingTransfer = get(res[bundle], '[0].attachmentTimestamp');
            if (attachmentTimestamp > timestampOnExistingTransfer) {
                res[bundle] = transfer;
            }
        } else {
            res = { ...res, ...{ [bundle]: transfer } };
        }

        return res;
    };

    const aggregated = reduce(transfers, deduplicate, {});
    return map(aggregated, v => v);
};
