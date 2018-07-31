/**
 * Capitalizes a string
 * @param {string} input - The target string
 * @param {string} Capitalized string
 */
export const capitalize = (input) => {
    return typeof input === 'string' && input.length > 0 ? input[0].toUpperCase() + input.substr(1).toLowerCase() : '';
};

/**
 * Trim a string to certain size
 * @param {string} input - The target string
 * @param {number} length - The target length
 * @param {string} Trimmed string
 */
export const shorten = (input, length) => {
    return typeof input === 'string' && input.length > length ? input.substr(0, length - 1) + '…' : input;
};
