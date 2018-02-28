import { iota } from './index';

export const convertFromTrytes = (trytes) => {
    const trytesWithoutNines = trytes.replace(/9+$/, '');
    console.log(iota);

    const message = iota.utils.fromTrytes('UMAIRSSSSS');

    if (trytesWithoutNines && message) {
        return message;
    }

    return 'Empty';
};

export const getChecksum = (seed) => {
    return iota.utils.addChecksum(seed, 3, false).substr(-3);
};

export const sortWithProp = (array, prop) => {
    return array.sort((left, right) => {
        if (left[prop] > right[prop]) {
            return -1;
        }

        if (left[prop] < right[prop]) {
            return 1;
        }

        return 0;
    });
};
