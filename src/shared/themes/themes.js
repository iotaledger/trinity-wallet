import tinycolor from 'tinycolor2';

import Default from './themes/Default';
import GreyDark from './themes/GreyDark';
import Mint from './themes/Mint';
import MonochromeLight from './themes/MonochromeLight';
import MonochromeDark from './themes/MonochromeDark';

export const themes = {
    Default: Default,
    Mint: Mint,
    /*,
    'Grey dark': GreyDark,
    'Monochrome Light': MonochromeLight,
    'Monochrome Dark': MonochromeDark,
    */
};

export const getHSL = (color) => {
    return tinycolor(color).toHslString();
};

export default {
    themes,
    getHSL,
};
