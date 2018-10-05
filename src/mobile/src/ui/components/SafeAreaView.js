import React, { Component } from 'react';
import SafeAreaView from 'react-native-safe-area-view';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { isIPhoneX } from 'libs/device';

export default function withSafeAreaView(WrappedComponent) {
    class EnhancedComponent extends Component {
        render() {
            return (
                <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent', marginBottom: isIPhoneX ? 34 : 0 }}>
                    <WrappedComponent {...this.props} />
                </SafeAreaView>
            );
        }
    }

    return hoistNonReactStatics(EnhancedComponent, WrappedComponent);
}
