import tinycolor from 'tinycolor2';

export const themes = {
    Default: {
        body: {
            color: tinycolor('#ffffff').toHsl(),
            background: tinycolor('#1a373e').toHsl(),
            secondary: tinycolor('#244146').toHsl(),
        },
        bar: {
            color: tinycolor('#ffffff').toHsl(),
            background: tinycolor('#0b282f').toHsl(),
            secondary: tinycolor('#436A72').toHsl(),
        },
        positive: {
            color: tinycolor('#009f3f').toHsl(),
        },
        secondary: {
            color: tinycolor('#436A72').toHsl(),
        },
        negative: {
            color: tinycolor('#f75602').toHsl(),
        },
        extra: {
            color: tinycolor('#88D4FF').toHsl(),
        },
        label: {
            color: tinycolor('#ffffff').toHsl(),
        },
        input: {
            color: tinycolor('#ffffff').toHsl(),
            background: tinycolor('#2a4a51').toHsl(),
            secondary: tinycolor('#94A8AC').toHsl(),
        },
        chart: {
            color: tinycolor('#FFA25B').toHsl(),
        },
        highlight: {
            color: tinycolor('#F7D002').toHsl(),
        },
        hover: {
            color: tinycolor('rgba(0,0,0,0.25)').toHsl(),
        },
        cta: {
            color: tinycolor('#9DFFAF').toHsl(),
        },
        /* TODO: Merge mobile and desktop styles */
        backgroundColor: {
            h: 191.66666666666663,
            s: 0.4090909090909091,
            l: 0.17254901960784313,
            a: 1,
        },
        barColor: {
            h: 191.66666666666669,
            s: 0.6206896551724137,
            l: 0.11372549019607844,
            a: 1,
        },
        ctaColor: {
            h: 143.77358490566039,
            s: 1,
            l: 0.31176470588235294,
            a: 1,
        },
        positiveColor: {
            h: 131.0204081632653,
            s: 1,
            l: 0.807843137254902,
            a: 1,
        },
        negativeColor: {
            h: 50.44897959183674,
            s: 0.9839357429718876,
            l: 0.48823529411764705,
            a: 1,
        },
        extraColor: {
            h: 201.68067226890756,
            s: 1,
            l: 0.7666666666666666,
            a: 1,
        },
        secondaryBarColor: 'white',
        secondaryBackgroundColor: 'white',
        secondaryCtaColor: 'white',
        ctaBorderColor: 'transparent',
        pendingColor: '#f75602',
        chartLineColor: '#FFA25B',
    },
    'Grey dark': {
        body: {
            color: tinycolor('#ffffff').toHsl(),
            background: tinycolor('#313131').toHsl(),
            secondary: tinycolor('#2B2B2B').toHsl(),
        },
        bar: {
            color: tinycolor('#ffffff').toHsl(),
            background: tinycolor('#1a1a1a').toHsl(),
            secondary: tinycolor('#436A72').toHsl(),
        },
        positive: {
            color: tinycolor('#009f3f').toHsl(),
        },
        secondary: {
            color: tinycolor('#1a1a1a').toHsl(),
        },
        negative: {
            color: tinycolor('#f75602').toHsl(),
        },
        extra: {
            color: tinycolor('#88D4FF').toHsl(),
        },
        input: {
            color: tinycolor('#ffffff').toHsl(),
            background: tinycolor('#282828').toHsl(),
            secondary: tinycolor('#888888').toHsl(),
        },
        chart: {
            color: tinycolor('#FFA25B').toHsl(),
        },
        highlight: {
            color: tinycolor('#F7D002').toHsl(),
        },
        hover: {
            color: tinycolor('rgba(0,0,0,0.25)').toHsl(),
        },
        cta: {
            color: tinycolor('#9DFFAF').toHsl(),
        },
    },
    Grey: {
        body: {
            color: tinycolor('#1E1E1E').toHsl(),
            background: tinycolor('#D9D9D9').toHsl(),
            secondary: tinycolor('#D1D1D1').toHsl(),
        },
        bar: {
            color: tinycolor('#D9D9D9').toHsl(),
            background: tinycolor('#1E1E1E').toHsl(),
            secondary: tinycolor('#292929').toHsl(),
        },
        positive: {
            color: tinycolor('#009C2C').toHsl(),
            body: tinycolor('#FFFFFF').toHsl(),
        },
        secondary: {
            color: tinycolor('#4F4F4F').toHsl(),
            body: tinycolor('#FFFFFF').toHsl(),
        },
        negative: {
            color: tinycolor('#CF6666').toHsl(),
            body: tinycolor('#FFFFFF').toHsl(),
        },
        extra: {
            color: tinycolor('#88D4FF').toHsl(),
            body: tinycolor('#FFFFFF').toHsl(),
        },
        input: {
            color: tinycolor('#1E1E1E').toHsl(),
            background: tinycolor('#cccccc').toHsl(),
            secondary: tinycolor('#727272').toHsl(),
        },
        chart: {
            color: tinycolor('#FFA25B').toHsl(),
        },
        highlight: {
            color: tinycolor('#66A8CF').toHsl(),
            body: tinycolor('#FFFFFF').toHsl(),
        },
        hover: {
            color: tinycolor('rgba(0,0,0,0.1)').toHsl(),
        },
        cta: {
            color: tinycolor('#66CF72').toHsl(),
        },
    },
    'Monochrome Light': {
        body: {
            color: tinycolor('#151515').toHsl(),
            background: tinycolor('#FAFAFA').toHsl(),
            secondary: tinycolor('#EEEEEE').toHsl(),
        },
        bar: {
            color: tinycolor('#151515').toHsl(),
            background: tinycolor('#F6F6F6').toHsl(),
            secondary: tinycolor('#151515').toHsl(),
        },
        positive: {
            color: tinycolor('#009f3f').toHsl(),
            background: tinycolor('transparent').toHsl(),
            border: tinycolor('#009f3f').toHsl(),
        },
        secondary: {
            color: tinycolor('#151515').toHsl(),
            background: tinycolor('transparent').toHsl(),
            border: tinycolor('#151515').toHsl(),
        },
        negative: {
            color: tinycolor('#f75602').toHsl(),
            background: tinycolor('transparent').toHsl(),
            border: tinycolor('#f75602').toHsl(),
        },
        extra: {
            color: tinycolor('#88D4FF').toHsl(),
            background: tinycolor('transparent').toHsl(),
            border: tinycolor('#88D4FF').toHsl(),
        },
        input: {
            color: tinycolor('#151515').toHsl(),
            background: tinycolor('transparent').toHsl(),
            border: tinycolor('#151515').toHsl(),
        },
        chart: {
            color: tinycolor('#FFA25B').toHsl(),
        },
        highlight: {
            color: tinycolor('#F7D002').toHsl(),
            background: tinycolor('transparent').toHsl(),
            border: tinycolor('#F7D002').toHsl(),
        },
        hover: {
            color: tinycolor('rgba(0,0,0,0.05)').toHsl(),
        },
        cta: {
            color: tinycolor('#009f3f').toHsl(),
        },
    },
    'Monochrome Dark': {
        body: {
            color: tinycolor('#FAFAFA').toHsl(),
            background: tinycolor('#151515').toHsl(),
            secondary: tinycolor('#151515').toHsl(),
        },
        bar: {
            color: tinycolor('#FAFAFA').toHsl(),
            background: tinycolor('#141414').toHsl(),
            secondary: tinycolor('#FAFAFA').toHsl(),
        },
        positive: {
            color: tinycolor('#009f3f').toHsl(),
            background: tinycolor('transparent').toHsl(),
            border: tinycolor('#009f3f').toHsl(),
        },
        secondary: {
            color: tinycolor('#D5D5D5').toHsl(),
            background: tinycolor('transparent').toHsl(),
            border: tinycolor('#D5D5D5').toHsl(),
        },
        negative: {
            color: tinycolor('#f75602').toHsl(),
            background: tinycolor('transparent').toHsl(),
            border: tinycolor('#f75602').toHsl(),
        },
        extra: {
            color: tinycolor('#88D4FF').toHsl(),
            background: tinycolor('transparent').toHsl(),
            border: tinycolor('#88D4FF').toHsl(),
        },
        input: {
            color: tinycolor('#FAFAFA').toHsl(),
            background: tinycolor('transparent').toHsl(),
            border: tinycolor('#FAFAFA').toHsl(),
        },
        chart: {
            color: tinycolor('#FFA25B').toHsl(),
        },
        highlight: {
            color: tinycolor('#F7D002').toHsl(),
            background: tinycolor('transparent').toHsl(),
            border: tinycolor('#F7D002').toHsl(),
        },
        hover: {
            color: tinycolor('rgba(255,255,255,0.05)').toHsl(),
        },
        cta: {
            color: tinycolor('#009f3f').toHsl(),
        },
    },
};

export const getHSL = (color) => {
    return tinycolor(color).toHslString();
};

export const hslToCSS = (hsla) => {
    return `hsla(${Math.round(hsla.h)},${Math.round(hsla.s * 100)}%,${Math.round(hsla.l * 100)}%,${hsla.a})`;
};

export default {
    themes,
    getHSL,
};
