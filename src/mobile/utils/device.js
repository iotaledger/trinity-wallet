import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

const device = DeviceInfo.getModel();

export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';
export const isIPhoneX = device.includes('iPhone X');
