import React, { Component } from 'react';
import { View } from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import PropTypes from 'prop-types';
import { Navigation } from 'react-native-navigation';
import { connect } from 'react-redux';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { getBackgroundColor } from 'ui/theme/general';

export default function withSafeAreaView(WrappedComponent) {
    class EnhancedComponent extends Component {
        static propTypes = {
            /** @ignore */
            theme: PropTypes.object.isRequired,
        };

        constructor(props) {
            super(props);
            this.state = {
                currentScreen: '',
            };
        }

        componentWillMount() {
            Navigation.events().registerComponentDidAppearListener((componentId) => {
                this.setState({ currentScreen: componentId.componentName });
            });
        }

        render() {
            const { theme } = this.props;
            const { currentScreen } = this.state;
            return (
                <SafeAreaView style={{ flex: 1, backgroundColor: getBackgroundColor(currentScreen, theme) }}>
                    <WrappedComponent {...this.props} />
                    <View style={{ height: 34, backgroundColor: getBackgroundColor(currentScreen, theme, true) }} />
                </SafeAreaView>
            );
        }
    }

    const mapStateToProps = (state) => ({
        theme: state.settings.theme,
    });

    return hoistNonReactStatics(connect(mapStateToProps)(EnhancedComponent), WrappedComponent);
}
