import tinycolor from 'tinycolor2';

const themes = {
    Default: {
        backgroundColor: tinycolor(`#1a373e`).toHsl(),
        barColor: tinycolor(`#0b282f`).toHsl(),
        ctaColor: tinycolor(`#009f3f`).toHsl(),
        positiveColor: tinycolor(`#9DFFAF`).toHsl(),
        negativeColor: tinycolor(`#F7D002`).toHsl(),
        extraColor: tinycolor(`#88D4FF`).toHsl(),
    },
    Grey: {
        backgroundColor: tinycolor(`#313131`).toHsl(),
        barColor: tinycolor(`#1a1a1a`).toHsl(),
        ctaColor: tinycolor(`#009f3f`).toHsl(),
        positiveColor: tinycolor(`#9DFFAF`).toHsl(),
        negativeColor: tinycolor(`#F7D002`).toHsl(),
        extraColor: tinycolor(`#88D4FF`).toHsl(),
    },
    Blue: {
        backgroundColor: tinycolor(`#20303f`).toHsl(),
        barColor: tinycolor(`#121c24`).toHsl(),
        ctaColor: tinycolor(`#009f3f`).toHsl(),
        positiveColor: tinycolor(`#9DFFAF`).toHsl(),
        negativeColor: tinycolor(`#F7D002`).toHsl(),
        extraColor: tinycolor(`#88D4FF`).toHsl(),
    },
};

const getHSL = color => {
    return tinycolor(color).toHslString();
};

export default {
    themes,
    getHSL,
};
