/**
 * Capitalizes a string
 * @param {string} input - The target string
 * @param {string} Capitalized string
 */
const capitalize = (input) => {
    return typeof input === 'string' && input.length > 0 ? input[0].toUpperCase() + input.substr(1).toLowerCase() : '';
};

/**
 * Trim a string to certain size
 * @param {string} input - The target string
 * @param {number} length - The target length
 * @param {string} Trimmed string
 */
const shorten = (input, length) => {
    return typeof input === 'string' && input.length > length ? input.substr(0, length - 1) + '…' : input;
};

/**
 * Tryte trit mapping
 */
const trytesTrits = [
    [0, 0, 0],
    [1, 0, 0],
    [-1, 1, 0],
    [0, 1, 0],
    [1, 1, 0],
    [-1, -1, 1],
    [0, -1, 1],
    [1, -1, 1],
    [-1, 0, 1],
    [0, 0, 1],
    [1, 0, 1],
    [-1, 1, 1],
    [0, 1, 1],
    [1, 1, 1],
    [-1, -1, -1],
    [0, -1, -1],
    [1, -1, -1],
    [-1, 0, -1],
    [0, 0, -1],
    [1, 0, -1],
    [-1, 1, -1],
    [0, 1, -1],
    [1, 1, -1],
    [-1, -1, 0],
    [0, -1, 0],
    [1, -1, 0],
    [-1, 0, 0],
];

/**
 * Convert trit to an ASCII character
 * @param {trit} trit - raw Trit input
 */
const byteToChar = (trit) => {
    return '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(trit % 27);
};

/**
 * Convert single character string to trit array
 * @param {string} char - Input character
 * @returns {array} Output trit array
 */
const charToByte = (char) => {
    return '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(char.toUpperCase());
};

const byteToTrit = (byte) => {
    return trytesTrits[byte % 27];
};

module.exports = {
    capitalize,
    shorten,
    byteToChar,
    byteToTrit,
    charToByte,
};
