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
const tritToChar = (trit) => {
    // <0.3.3 support
    // Seed characters where stored as bytes not trits
    if (typeof trit === 'number') {
        return '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(trit % 27);
    }

    if (trit.length < 3) {
        return false;
    }

    for (let i = 0; i < trytesTrits.length; i++) {
        if (trit[0] === trytesTrits[i][0] && trit[1] === trytesTrits[i][1] && trit[2] === trytesTrits[i][2]) {
            return '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(i);
        }
    }
};

/**
 * Convert single character string to trit array
 * @param {string} char - Input character
 * @returns {array} Output trit array
 */
const charToTrit = (char) => {
    return trytesTrits['9ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(char)];
};

module.exports = {
    capitalize,
    shorten,
    trytesTrits,
    tritToChar,
    charToTrit,
};
