import get from 'lodash/get';
import each from 'lodash/each';
import transform from 'lodash/transform';
import { isMinutesAgo, convertUnixTimeToJSDate } from '../libs/dateUtils';
import { iota } from '../libs/iota';

export const isAboveMaxDepth = timestamp => {
    return timestamp < Date.now() && Math.floor(Date.now()) - parseInt(timestamp) < 14 * 2 * 60 * 1000;
};

export const getFirstConsistentTail = (tails, idx) => {
    if (!tails[idx]) {
        return Promise.resolve(false);
    }

    return iota.api.isPromotable(get(tails[idx], 'hash')).then(state => {
        if (state && isAboveMaxDepth(get(tails[idx], 'attachmentTimestamp'))) {
            return tails[idx];
        }

        idx += 1;
        return getFirstConsistentTail(tails, idx);
    });
};

export const isWithinAnHourAndTenMinutesAgo = timestamp =>
    isMinutesAgo(convertUnixTimeToJSDate(timestamp), 1) && !isMinutesAgo(convertUnixTimeToJSDate(timestamp), 60);

export const getBundleTailsForSentTransfers = (transfers, addresses) => {
    const categorizedTransfers = iota.utils.categorizeTransfers(transfers, addresses);
    const sentTransfers = get(categorizedTransfers, 'sent');

    const grabTails = (payload, val) => {
        each(val, v => {
            const hasMadeTransactionWithinAnHour = isWithinAnHourAndTenMinutesAgo(v.timestamp);

            if (!v.persistence && v.currentIndex === 0 && v.value > 0 && hasMadeTransactionWithinAnHour) {
                const bundle = v.bundle;

                if (bundle in payload) {
                    payload[bundle] = [...payload[bundle], v];
                } else {
                    payload[bundle] = [v];
                }
            }
        });
    };

    return transform(sentTransfers, grabTails, {});
};
