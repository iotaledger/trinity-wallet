import welcome from './welcome.json';
import get from 'lodash.get';

import themes from '../themes/themes';

export const animations = {
    welcome,
};

/**
 * Returns colorised Lottie animation data
 * @param {string} animationName - Target animation name
 * @param {object} themeName - Target colors
 * @returns {object} -Target animation data
 */
export const getAnimation = (animationName, themeName) => {
    const data = animations[animationName];
    const theme = themes[themeName];

    if (!data) {
        return null;
    }

    return theme ? replaceColors(data, theme) : data;
};

/**
 * Converts rgb color to vector array
 * @param {string} color - target color in rgb(255,255,255) form
 * @returns {array} - color as vector array
 */
const rgbToVector = (color) => {
    if (!color) {
        return [1, 1, 1, 1];
    }
    const precision = 1000000;

    return color
        .substr(color.indexOf('(') + 1)
        .split(',')
        .map((str) => Math.floor(parseInt(str) / 255 * precision) / precision)
        .concat([1]);
};

const defaultTones = [
    'rgb(3,41,62)',
    'rgb(147,168,172)',
    'rgb(65,220,243)',
    'rgb(15,62,87)',
    'rgb(208,220,238)',
    'rgb(4,52,81)',
    'rgb(61,91,107)',
    'rgb(192,205,225)',
    'rgb(7,30,39)',
].map((tone) => rgbToVector(tone));

/**
 * Replaces Lottie animation data colors to corresponding theme colors
 * @param {object} tree - target animation data
 * @param {object} theme - target theme data
 * @returns {object} - result animation data
 */
const replaceColors = (data, theme) => {
    const tones = theme.animations;

    if (!tones) {
        return result;
    }

    let result = JSON.stringify(data);

    defaultTones.forEach((defaultTone, index) => {
        const regex = new RegExp(
            `\\[(${defaultTone[0]})([0-9,]*)(${defaultTone[1]})([0-9,]*)(${defaultTone[2]})([0-9,]*)\\]`,
            'g',
        );
        const color = rgbToVector(tones[index].indexOf('rgb') === 0 ? tones[index] : get(theme, tones[index]));
        result = result.replace(regex, `[${color.join(',')}]`);
    });

    return JSON.parse(result);
};
