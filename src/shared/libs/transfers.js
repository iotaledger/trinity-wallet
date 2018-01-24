import { DEFAULT_TAG } from '../config';
import { iota } from './iota';

export const prepareTransferArray = (address, value, message, tag = DEFAULT_TAG) => {
    return [
        {
            address,
            value,
            message: iota.utils.toTrytes(message),
            tag: iota.utils.toTrytes(tag),
        },
    ];
};
