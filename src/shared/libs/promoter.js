import get from 'lodash/get';
import each from 'lodash/each';
import transform from 'lodash/transform';
import { isMinutesAgo, convertUnixTimeToJSDate, isValid } from '../libs/dateUtils';
import { iota } from '../libs/iota';

export const isAboveMaxDepth = timestamp => {
    return timestamp < Date.now() && Date.now() - parseInt(timestamp) < 11 * 60 * 1000;
};

export const getFirstConsistentTail = (tails, idx) => {
    if (!tails[idx]) {
        return Promise.resolve(false);
    }

    return iota.api
        .isPromotable(get(tails[idx], 'hash'))
        .then(state => {
            if (state && isAboveMaxDepth(get(tails[idx], 'attachmentTimestamp'))) {
                return tails[idx];
            }

            idx += 1;
            return getFirstConsistentTail(tails, idx);
        })
        .catch(() => false);
};

export const isWithinAnHourAndTenMinutesAgo = timestamp => {
    const dateObject = convertUnixTimeToJSDate(timestamp);

    if (isValid(dateObject.format())) {
        return isMinutesAgo(dateObject, 10) && !isMinutesAgo(dateObject, 60);
    }

    return (
        isMinutesAgo(convertUnixTimeToJSDate(timestamp / 1000), 10) &&
        !isMinutesAgo(convertUnixTimeToJSDate(timestamp / 1000), 60)
    );
};

export const isWithinAnHour = timestamp => {
    const dateObject = convertUnixTimeToJSDate(timestamp);

    if (isValid(dateObject.format())) {
        return !isMinutesAgo(dateObject, 60);
    }

    return !isMinutesAgo(convertUnixTimeToJSDate(timestamp / 1000), 60);
};

export const isTenMinutesAgo = timestamp => {
    const dateObject = convertUnixTimeToJSDate(timestamp);

    if (isValid(dateObject.format())) {
        return isMinutesAgo(dateObject, 10);
    }

    return isMinutesAgo(convertUnixTimeToJSDate(timestamp / 1000), 10);
};

export const isAnHourAgo = timestamp => {
    const dateObject = convertUnixTimeToJSDate(timestamp);

    if (isValid(dateObject.format())) {
        return isMinutesAgo(dateObject, 60);
    }

    return isMinutesAgo(convertUnixTimeToJSDate(timestamp / 1000), 60);
};

export const getBundleTailsForSentTransfers = (transfers, addresses) => {
    const categorizedTransfers = iota.utils.categorizeTransfers(transfers, addresses);
    const sentTransfers = get(categorizedTransfers, 'sent');

    const grabTails = (payload, val) => {
        each(val, v => {
            const attachmentTimestamp = get(v, 'attachmentTimestamp');

            // Pick all those transaction that were replayed with in the last hour
            const hasMadeReattachmentWithinAnHour = isWithinAnHour(attachmentTimestamp);

            if (!v.persistence && v.currentIndex === 0 && v.value > 0 && hasMadeReattachmentWithinAnHour) {
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
