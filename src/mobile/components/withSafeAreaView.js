import React from 'react';
import SafeAreaView from 'react-native-safe-area-view';
import hoistNonReactStatics from 'hoist-non-react-statics';
import COLORS from '../theme/Colors';
import { isIPhoneX } from '../util/device';

export default function withSafeAreaView(WrappedComponent) {
    function EnhancedComponent(props) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: isIPhoneX ? COLORS.backgroundBlack : 'transparent' }}>
                <WrappedComponent {...props} />
            </SafeAreaView>
        );
    }

    return hoistNonReactStatics(EnhancedComponent, WrappedComponent);
}
