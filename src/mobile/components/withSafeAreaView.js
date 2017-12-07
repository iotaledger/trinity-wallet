import React from 'react';
import SafeAreaView from 'react-native-safe-area-view';
import hoistNonReactStatics from 'hoist-non-react-statics';

// TODO Replace this with the react-native SafeAreaView when we update to 0.50+
export default function withSafeAreaView(WrappedComponent) {
    function EnhancedComponent(props) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#071f28' }}>
                <WrappedComponent {...props} />
            </SafeAreaView>
        );
    }

    return hoistNonReactStatics(EnhancedComponent, WrappedComponent);
}
