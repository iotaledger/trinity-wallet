import React from 'react';
import SafeAreaView from 'react-native-safe-area-view';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { isIPhone11 } from 'libs/device';

export default function withSafeAreaView(WrappedComponent) {
    function EnhancedComponent(props) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent', marginBottom: isIPhone11 ? 34 : 0 }}>
                <WrappedComponent {...props} />
            </SafeAreaView>
        );
    }

    return hoistNonReactStatics(EnhancedComponent, WrappedComponent);
}
