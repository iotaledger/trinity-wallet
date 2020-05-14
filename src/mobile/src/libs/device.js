import { Platform, PermissionsAndroid } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import i18next from 'shared-modules/libs/i18next';

const deviceId = DeviceInfo.getDeviceId();

export const locale = DeviceInfo.getDeviceLocale();
export const timezone = DeviceInfo.getTimezone();

export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';
export const isIPhoneX =
    isIOS &&
    (deviceId === 'iPhone10,3' || deviceId === 'iPhone10,6' || parseInt(deviceId.substring(6, 8)) >= 11) &&
    deviceId !== 'iPhone12,8';
export const isIPhone11 = deviceId.includes('iPhone11');

export const getAndroidFileSystemPermissions = async () => {
    const hasPermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
    if (!hasPermission) {
        return this.props.generateAlert(
            'error',
            i18next.t('missingPermission'),
            i18next.t('missingPermissionExplanation'),
        );
    }
};
