const DeviceInfo = jest.genMockFromModule('react-native-device-info');

DeviceInfo.getModel = () => 'mock-device';

export default DeviceInfo;
