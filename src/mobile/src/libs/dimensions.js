import { Dimensions } from 'react-native';
import ExtraDimensions from 'react-native-extra-dimensions-android';
import { isAndroid, isIPhoneX } from 'libs/device';

global.height = isAndroid
    ? ExtraDimensions.get('REAL_WINDOW_HEIGHT') - ExtraDimensions.get('SOFT_MENU_BAR_HEIGHT')
    : Dimensions.get('window').height;

// StatusBar area where we avoid drawing
const iPhoneXTop = 44;
// Area below tabs where we avoid drawing
const iPhoneXBottom = 34;

if (isIPhoneX) {
    global.height -= iPhoneXTop + iPhoneXBottom;
}

export const width = Dimensions.get('window').width;
export const height = global.height;
