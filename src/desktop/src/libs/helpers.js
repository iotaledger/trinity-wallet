/**
 * Capitalizes a string
 * @param {String} input - The target string
 * @returns {String} Capitalized string
 */
export const capitalize = (input) => {
    return typeof input === 'string' && input.length > 0 ? input[0].toUpperCase() + input.substr(1).toLowerCase() : '';
};

/**
 * Trim a string to certain size
 * @param {String} input - The target string
 * @param {Number} length - The target length
 * @returns {String} Trimmed string
 */
export const shorten = (input, length) => {
    return typeof input === 'string' && input.length > length ? input.substr(0, length - 1) + '…' : input;
};
