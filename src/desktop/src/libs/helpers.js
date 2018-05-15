/**
 * Capitalizes a string
 * @param {String} input - The target string
 */
export const capitalize = (input) => {
    return input[0].toUpperCase() + input.substr(1).toLowerCase();
};
