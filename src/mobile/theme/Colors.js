const BaseColors = {
    blueDarker: '#102E36',
    greenLight: '#009F3F',
    greenLighter: '#9DFFAF',
    orangeDark: '#F7D002',
    red: '#FF220C',
    redLight: '#B21C17',
    redDark: '#A10702',
    white: '#FFFFFF',
    backgroundGreen: '#1B4149',
    backgroundGray: '#3B3B3B',
    backgroundBlack: '#1a1b1b',
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
