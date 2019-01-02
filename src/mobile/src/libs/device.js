import { Platform, PermissionsAndroid } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import i18next from 'shared-modules/libs/i18next';

const device = DeviceInfo.getModel();
const deviceId = DeviceInfo.getDeviceId();

export const locale = DeviceInfo.getDeviceLocale();
export const timezone = DeviceInfo.getTimezone();

export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';
export const isIPhoneX = device.includes('iPhone X') || deviceId.includes('iPhone11');
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
