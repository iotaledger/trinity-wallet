import tinycolor from 'tinycolor2';

const themes = {
    Default: {
        backgroundColor: tinycolor(`#1a373e`).toHsl(),
        barColor: tinycolor(`#0b282f`).toHsl(),
        ctaColor: tinycolor(`#009f3f`).toHsl(),
        positiveColor: tinycolor(`#9DFFAF`).toHsl(),
        negativeColor: tinycolor(`#F7D002`).toHsl(),
        extraColor: tinycolor(`#88D4FF`).toHsl(),
        secondaryBarColor: 'white',
        secondaryBackgroundColor: 'white',
        secondaryCtaColor: 'white',
        ctaBorderColor: 'transparent',
        pendingColor: '#f75602',
        chartLineColor: '#FFA25B'
    },
    Grey: {
        backgroundColor: tinycolor(`#313131`).toHsl(),
        barColor: tinycolor(`#1a1a1a`).toHsl(),
        ctaColor: tinycolor(`#009f3f`).toHsl(),
        positiveColor: tinycolor(`#9DFFAF`).toHsl(),
        negativeColor: tinycolor(`#F7D002`).toHsl(),
        extraColor: tinycolor(`#88D4FF`).toHsl(),
        secondaryBarColor: 'white',
        secondaryBackgroundColor: 'white',
        secondaryCtaColor: 'white',
        ctaBorderColor: 'transparent',
        pendingColor: '#f75602',
        chartLineColor: '#FFA25B'
    },
    Blue: {
        backgroundColor: tinycolor(`#20303f`).toHsl(),
        barColor: tinycolor(`#121c24`).toHsl(),
        ctaColor: tinycolor(`#009f3f`).toHsl(),
        positiveColor: tinycolor(`#9DFFAF`).toHsl(),
        negativeColor: tinycolor(`#F7D002`).toHsl(),
        extraColor: tinycolor(`#88D4FF`).toHsl(),
        secondaryBarColor: 'white',
        secondaryBackgroundColor: 'white',
        secondaryCtaColor: 'white',
        ctaBorderColor: 'transparent',
        pendingColor: '#f75602',
        chartLineColor: '#FFA25B'
    },
    Light: {
        backgroundColor: tinycolor(`white`).toHsl(),
        barColor: tinycolor(`white`).toHsl(),
        ctaColor: tinycolor(`white`).toHsl(),
        positiveColor: tinycolor(`black`).toHsl(),
        negativeColor: tinycolor(`#black`).toHsl(),
        extraColor: tinycolor(`#black`).toHsl(),
        secondaryBarColor: 'black',
        secondaryBackgroundColor: 'black',
        secondaryCtaColor: 'black',
        ctaBorderColor: 'black',
        pendingColor: '#f75602',
        chartLineColor: 'black'
    },
    Dark: {
        backgroundColor: tinycolor(`black`).toHsl(),
        barColor: tinycolor(`black`).toHsl(),
        ctaColor: tinycolor(`black`).toHsl(),
        positiveColor: tinycolor(`#9DFFAF`).toHsl(),
        negativeColor: tinycolor(`#F7D002`).toHsl(),
        extraColor: tinycolor(`#88D4FF`).toHsl(),
        secondaryBarColor: 'white',
        secondaryBackgroundColor: 'white',
        secondaryCtaColor: 'white',
        ctaBorderColor: 'white',
        pendingColor: '#f75602',
        chartLineColor: 'white'
    }
    /* Custom: {
        backgroundColor: tinycolor(`#1a373e`).toHsl(),
        barColor: tinycolor(`#0b282f`).toHsl(),
        ctaColor: tinycolor(`#009f3f`).toHsl(),
        positiveColor: tinycolor(`#9DFFAF`).toHsl(),
        negativeColor: tinycolor(`#F7D002`).toHsl(),
        extraColor: tinycolor(`#88D4FF`).toHsl(),
        secondaryBarColor: 'white',
        secondaryBackgroundColor: 'white',
        secondaryCtaColor: 'white',
        ctaBorderColor: 'transparent',
        pendingColor: '#f75602',
        chartLineColor: 'white',
    }, */
};

const getHSL = color => {
    return tinycolor(color).toHslString();
};

export default {
    themes,
    getHSL
};
