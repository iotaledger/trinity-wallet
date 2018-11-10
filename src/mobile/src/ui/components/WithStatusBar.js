import React, { PureComponent } from 'react';
import { View } from 'react-native';
import DynamicStatusBar from 'ui/components/DynamicStatusBar';

export default function withStatusBar(WrappedComponent) {
    class EnhancedComponent extends PureComponent {
        render() {
            return (
                <View style={{ flex: 1 }}>
                    <WrappedComponent {...this.props} />
                    <DynamicStatusBar />
                </View>
            );
        }
    }

    return EnhancedComponent;
}
