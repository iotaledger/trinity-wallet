import tinycolor from 'tinycolor2';

import Default from './themes/Default';
import Electric from './themes/Electric';
import Mint from './themes/Mint';
import Ionic from './themes/Ionic';
import SteelBlue from './themes/SteelBlue';
import Contemporary from './themes/Contemporary';

export const themes = {
    Default: Default,
    Mint: Mint,
    Electric: Electric,
    Ionic: Ionic,
    SteelBlue: SteelBlue,
    Contemporary: Contemporary,
};

export const getHSL = (color) => {
    return tinycolor(color).toHslString();
};

export default {
    themes,
    getHSL,
};
