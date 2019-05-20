import get from 'lodash/get';
import welcome from './welcome.json';
import language from './language.json';
import ledger from './ledger.json';
import onboardingComplete from './onboardingComplete.json';
import sending from './transactionA.json';
import logout from './thanks.json';
import loading from './loading.json';

import themes from '../themes/themes';

export const animations = {
    language,
    ledger,
    onboardingComplete,
    welcome,
    sending,
    logout,
    loading,
};

/**
 * Returns colorised Lottie animation data
 * @param {string} animationName - Target animation name
 * @param {object} themeName - Target colors
 * @returns {object} - Target animation data
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
        .map((str) => Math.floor((parseInt(str) / 255) * precision) / precision)
        .concat([1]);
};

const defaultTones = [
    //rgb(240,242,246)
    [0.941176, 0.949019, 0.964705, 1],
    //rgb(3,41,62)
    [0.011764, 0.160784, 0.243137, 1],
    //rgb(147,168,172)
    [0.57647, 0.658823, 0.674509, 1],
    //rgb(65,220,243)
    [0.254901, 0.862745, 0.952941, 1],
    //rgb(15,62,87)
    [0.058823, 0.243137, 0.341176, 1],
    //rgb(208,220,238)
    [0.815686, 0.862745, 0.933333, 1],
    //rgb(4,52,81)
    [0.015686, 0.203921, 0.317647, 1],
    //rgb(61,91,107)
    [0.239215, 0.356862, 0.419607, 1],
    //rgb(192,205,225)
    [0.752941, 0.803921, 0.882352, 1],
    //rgb(7,30,39)
    [0.02745, 0.117647, 0.152941, 1],
];

/**
 * Replaces Lottie animation data colors to corresponding theme colors
 * @param {object} tree - target animation data
 * @param {object} theme - target theme data
 * @returns {object} - result animation data
 */
const replaceColors = (data, theme) => {
    const tones = theme.animations;

    if (!tones) {
        return data;
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
