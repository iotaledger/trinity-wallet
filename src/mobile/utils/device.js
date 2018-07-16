import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import BackgroundFetch from 'react-native-background-fetch';

const device = DeviceInfo.getModel();

export const locale = DeviceInfo.getDeviceLocale();

export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';
export const isIPhoneX = device.includes('iPhone X');

/**
 * Wrapper for BackgroundFetch.status (see https://github.com/transistorsoft/react-native-background-fetch#methods)
 * - iOS
 *  Returns BackgroundFetch.STATUS_RESTRICTED (0) if restricted (e.g. by parental controls)
 *  Returns BackgroundFetch.STATUS_DENIED (1) if disabled (e.g. by device settings)
 *  Returns BackgroundFetch.STATUS_AVAILABLE (2) if available
 * - Android
 *  Always returns BackgroundFetch.STATUS_AVAILABLE (2)
 * @return {Integer} Status
 */
export const backgroundFetchStatus = () => {
    return new Promise((resolve) => {
        BackgroundFetch.status((status) => {
            if (status) {
                resolve(status);
            }
        });
    });
};
