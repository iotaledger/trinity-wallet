import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import RNIsDeviceRooted from 'react-native-is-device-rooted';

const device = DeviceInfo.getModel();

export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';
export const isIPhoneX = device.includes('iPhone X');

export const isRooted = RNIsDeviceRooted.isDeviceRooted();
