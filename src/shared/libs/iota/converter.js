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

const tritStrings = trytesTrits.map((trit) => trit.toString());

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

/**
 * Convert single byte to trit array
 * @param {number} byte - Input byte
 * @returns {array} Output trit array
 */
const byteToTrit = (byte) => {
    return trytesTrits[byte % 27];
};

/**
 * Convert byte array to trit array
 * @param {array} bytes - Input byte array
 * @returns {array} Output trit array
 */
const bytesToTrits = (bytes) => {
    let trits = [];
    for (let i = 0; i < bytes.length; i++) {
        trits = trits.concat(byteToTrit(bytes[i]));
    }
    return trits;
};

/**
 * Converts tryte string to trits
 *
 * @method trytesToTrits
 * @param {String} input - Tryte string to be converted.
 *
 * @return {Int8Array} trits
 */
const trytesToTrits = (input) => {
    const result = new Int8Array(input.length * 3);
    for (let i = 0; i < input.length; i++) {
        const index = '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(input.charAt(i));
        result[i * 3] = trytesTrits[index][0];
        result[i * 3 + 1] = trytesTrits[index][1];
        result[i * 3 + 2] = trytesTrits[index][2];
    }
    return result;
};

/**
 * Convert trit array to string
 * @param {array} trits - Input trit array
 * @returns {string} Output string
 */
const tritsToChars = (trits) => {
    let chars = '';
    for (let i = 0; i < trits.length; i += 3) {
        const trit = trits.slice(i, i + 3).toString();
        for (let x = 0; x < tritStrings.length; x++) {
            if (tritStrings[x] === trit) {
                chars += '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(x);
            }
        }
    }
    return chars;
};

module.exports = { capitalize, shorten, byteToChar, byteToTrit, bytesToTrits, tritsToChars, charToByte, trytesToTrits };
