import React from 'react';
import SafeAreaView from 'react-native-safe-area-view';
import hoistNonReactStatics from 'hoist-non-react-statics';

// TODO Replace this with the react-native SafeAreaView when we update to 0.50+
var DeviceInfo = require('react-native-device-info');
const device = DeviceInfo.getDeviceId();
const isIPhoneX = device.includes('iPhone10');

export default function withSafeAreaView(WrappedComponent) {
    function EnhancedComponent(props) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: isIPhoneX ? '#071f28' : 'transparent' }}>
                <WrappedComponent {...props} />
            </SafeAreaView>
        );
    }

    return hoistNonReactStatics(EnhancedComponent, WrappedComponent);
}
