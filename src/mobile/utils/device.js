import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { detectLocale } from 'iota-wallet-shared-modules/libs/locale';

const device = DeviceInfo.getModel();

export const locale = detectLocale(DeviceInfo.getDeviceLocale());

export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';
export const isIPhoneX = device.includes('iPhone X');
