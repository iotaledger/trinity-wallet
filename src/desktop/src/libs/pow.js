import Curl from 'curl.lib.js';

/**
 * Get Proof of Work function
 * @returns {Function} Proof of Work function
 */
export const getPoWFn = () => {
    Curl.init();

    const powFn = (trytes, minWeight) => {
        return Curl.pow({ trytes, minWeight });
    };

    return powFn;
};
