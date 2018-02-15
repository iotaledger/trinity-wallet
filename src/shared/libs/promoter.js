import assign from 'lodash/assign';
import get from 'lodash/get';
import each from 'lodash/each';
import transform from 'lodash/transform';
import reduce from 'lodash/reduce';
import keys from 'lodash/keys';
import map from 'lodash/map';
import { getBalancesSync, getBalancesAsync, accumulateBalance } from './accountUtils';
import { DEFAULT_BALANCES_THRESHOLD } from '../config';
import { isMinutesAgo, convertUnixTimeToJSDate, isValid } from '../libs/dateUtils';
import { iota } from '../libs/iota';

export const isAboveMaxDepth = (timestamp) => {
    return timestamp < Date.now() && Date.now() - parseInt(timestamp) < 11 * 60 * 1000;
};

export const getFirstConsistentTail = (tails, idx) => {
    if (!tails[idx]) {
        return Promise.resolve(false);
    }

    return iota.api
        .isPromotable(get(tails[idx], 'hash'))
        .then((state) => {
            if (state && isAboveMaxDepth(get(tails[idx], 'attachmentTimestamp'))) {
                return tails[idx];
            }

            idx += 1;
            return getFirstConsistentTail(tails, idx);
        })
        .catch(() => false);
};

export const isWithinADayAndTenMinutesAgo = (timestamp) => {
    const dateObject = convertUnixTimeToJSDate(timestamp);

    if (isValid(dateObject.format())) {
        return isMinutesAgo(dateObject, 10) && !isMinutesAgo(dateObject, 1440);
    }

    return (
        isMinutesAgo(convertUnixTimeToJSDate(timestamp / 1000), 10) &&
        !isMinutesAgo(convertUnixTimeToJSDate(timestamp / 1000), 1440)
    );
};

export const isWithinADay = (timestamp) => {
    const dateObject = convertUnixTimeToJSDate(timestamp);

    if (isValid(dateObject.format())) {
        return !isMinutesAgo(dateObject, 1440);
    }

    return !isMinutesAgo(convertUnixTimeToJSDate(timestamp / 1000), 1440);
};

export const isTenMinutesAgo = (timestamp) => {
    const dateObject = convertUnixTimeToJSDate(timestamp);

    if (isValid(dateObject.format())) {
        return isMinutesAgo(dateObject, 10);
    }

    return isMinutesAgo(convertUnixTimeToJSDate(timestamp / 1000), 10);
};

export const isADayAgo = (timestamp) => {
    const dateObject = convertUnixTimeToJSDate(timestamp);

    if (isValid(dateObject.format())) {
        return isMinutesAgo(dateObject, 1440);
    }

    return isMinutesAgo(convertUnixTimeToJSDate(timestamp / 1000), 1440);
};

const filterInvalidTransfersForPromotionSync = (transfers, addressData) => {
    const validTransfers = [];

    each(transfers, (bundle) => {
        const balanceOnBundle = bundle.reduce((acc, tx) => (tx.value < 0 ? acc + Math.abs(tx.value) : acc), 0);

        const addresses = bundle.filter((tx) => tx.value < 0).map((tx) => tx.address);
        const balances = getBalancesSync(addresses, addressData);
        const latestBalance = accumulateBalance(balances);

        if (balanceOnBundle <= latestBalance) {
            validTransfers.push(bundle);
        }
    });
};

const filterInvalidTransfersForPromotionAsync = (transfers) => {
    return reduce(
        transfers,
        (promise, bundle) => {
            return promise
                .then((result) => {
                    const balanceOnBundle = bundle.reduce(
                        (acc, tx) => (tx.value < 0 ? acc + Math.abs(tx.value) : acc),
                        0,
                    );

                    const addresses = bundle.filter((tx) => tx.value < 0).map((tx) => tx.address);

                    return getBalancesAsync(addresses, DEFAULT_BALANCES_THRESHOLD).then((balances) => {
                        const latestBalance = accumulateBalance(map(balances.balances, Number));

                        if (balanceOnBundle <= latestBalance) {
                            result.push(bundle);
                        }

                        return result;
                    });
                })
                .catch(console.error);
        },
        Promise.resolve([]),
    );
};

export const getBundleTailsForValidTransfers = (transfers, addressData, account) => {
    const addresses = keys(addressData);
    const { sent, received } = iota.utils.categorizeTransfers(transfers, addresses);

    const byBundles = (acc, transfers) => {
        each(transfers, (tx) => {
            const isTail = tx.currentIndex === 0;
            const isValueTransfer = tx.value !== 0;
            const isPending = !tx.persistence;

            if (isPending && isTail && isValueTransfer) {
                const bundle = tx.bundle;
                const withAccount = assign({}, tx, { account });

                if (bundle in acc) {
                    acc[bundle] = [...acc[bundle], withAccount];
                } else {
                    acc[bundle] = [withAccount];
                }
            }
        });
    };

    const validSentTransfers = filterInvalidTransfersForPromotionSync(sent, addressData);
    const allValidSentTransferTailsByBundle = transform(validSentTransfers, byBundles, {});

    return filterInvalidTransfersForPromotionAsync(received).then((validReceivedTransfers) => {
        const allValidReceivedTransferTailsByBundle = transform(validReceivedTransfers, byBundles, {});

        return { ...allValidSentTransferTailsByBundle, ...allValidReceivedTransferTailsByBundle };
    });
};
