const BaseColors = {
    blueDarker: '#102E36',
    greenLight: '#009F3F',
    greenLighter: '#9DFFAF',
    orangeDark: '#F7D002',
    red: '#FF220C',
    redLight: '#B21C17',
    redDark: '#A10702',
    white: '#FFFFFF',
    backgroundGreen: '#1a373e',
    backgroundGray: '#3B3B3B',
    backgroundBlack: '#1A1A1A',
    backgroundDarkGreen: '#0b282f',
};

export default {
    ...BaseColors,
    brand: {
        primary: BaseColors.blueDarker,
    },
    dropdown: {
        success: BaseColors.greenLight,
        error: BaseColors.redDark,
    },
};
