import tinycolor from 'tinycolor2';

export const themes = {
    Default: {
        body: tinycolor('#ffffff').toHsl(),
        bg: tinycolor('#1a373e').toHsl(),
        bgSecondary: tinycolor('#234046').toHsl(),
        bgSecondaryBody: tinycolor('#bababa').toHsl(),
        bgBar: tinycolor('#0b282f').toHsl(),
        highlight: tinycolor('#F7D002').toHsl(),
        highlightBody: tinycolor('#F7D002').toHsl(),
        positive: tinycolor('#009f3f').toHsl(),
        positiveBody: tinycolor('#009f3f').toHsl(),
        negative: tinycolor('#f75602').toHsl(),
        negativeBody: tinycolor('#f75602').toHsl(),
        extra: tinycolor('#88D4FF').toHsl(),
        extraBody: tinycolor('#88D4FF').toHsl(),
        input: tinycolor('#2a4a51').toHsl(),
        chartLine: tinycolor('#FFA25B').toHsl(),
        border: { h: 0, s: 0, l: 0, a: 0 },
    },
    White: {
        body: tinycolor('#000000').toHsl(),
        bg: tinycolor('#ffffff').toHsl(),
        bgSecondary: tinycolor('#F6F6F6').toHsl(),
        bgSecondaryBody: tinycolor('#717171').toHsl(),
        bgBar: tinycolor('#F6F6F6').toHsl(),
        highlight: tinycolor('#cccccc').toHsl(),
        highlightBody: tinycolor('#F7D002').toHsl(),
        positive: tinycolor('#ffffff').toHsl(),
        positiveBody: tinycolor('#009f3f').toHsl(),
        negative: tinycolor('#ffffff').toHsl(),
        negativeBody: tinycolor('f75602').toHsl(),
        extra: tinycolor('#ffffff').toHsl(),
        extraBody: tinycolor('#88D4FF').toHsl(),
        input: tinycolor('#ffffff').toHsl(),
        chartLine: tinycolor('#5B5B5B').toHsl(),
        border: tinycolor('#5B5B5B').toHsl(),
    },
};

export const getHSL = (color) => {
    return tinycolor(color).toHslString();
};
