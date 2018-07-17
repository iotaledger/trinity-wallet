const DeviceInfo = jest.genMockFromModule('react-native-device-info');

DeviceInfo.getModel = () => 'mock-device';
DeviceInfo.getVersion = () => 'foo';
DeviceInfo.getBuildNumber = () => 1;
DeviceInfo.getDeviceLocale = () => 'en_UK';

export default DeviceInfo;
