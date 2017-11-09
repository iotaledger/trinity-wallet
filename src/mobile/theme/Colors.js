const BaseColors = {
    blueDarker: '#102E36',
    greenLight: '#009F3F',
    greenLighter: '#9DFFAF',
    orangeDark: '#F7D002',
    red: '#FF220C',
    redLight: '#B21C17',
    white: '#FFFFFF',
};

export default {
    ...BaseColors,
    brand: {
        primary: BaseColors.blueDarker,
    },
    dropdown: {
        success: BaseColors.greenLight,
        error: BaseColors.red,
    },
};
