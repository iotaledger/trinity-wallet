/**
 * Capitalizes a string
 * @param {String} input - The target string
 */
export const capitalize = (input) => {
    return typeof input === 'string' && input.length > 0 ? input[0].toUpperCase() + input.substr(1).toLowerCase() : '';
};
