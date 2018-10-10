import React, { Component } from 'react';
import { View } from 'react-native';
import { Navigation } from 'react-native-navigation';
import PropTypes from 'prop-types';
import DynamicStatusBar from 'ui/components/DynamicStatusBar';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { connect } from 'react-redux';
import { getBackgroundColor } from 'ui/theme/general';

export default function withStatusBar(WrappedComponent) {
    class EnhancedComponent extends Component {
        static propTypes = {
            /** @ignore */
            inactive: PropTypes.bool.isRequired,
            /** @ignore */
            theme: PropTypes.object.isRequired,
            /** @ignore */
            isModalActive: PropTypes.bool.isRequired,
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
            const { theme, inactive, isModalActive } = this.props;
            const bg = getBackgroundColor(this.state.currentScreen, theme, false, inactive);
            return (
                <View style={{ flex: 1 }}>
                    <WrappedComponent {...this.props} />
                    <DynamicStatusBar backgroundColor={bg} isModalActive={isModalActive} />
                </View>
            );
        }
    }

    const mapStateToProps = (state) => ({
        inactive: state.ui.inactive,
        theme: state.settings.theme,
        isModalActive: state.ui.isModalActive,
    });

    return hoistNonReactStatics(connect(mapStateToProps)(EnhancedComponent), WrappedComponent);
}
