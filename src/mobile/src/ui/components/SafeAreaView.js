import React, { Component } from 'react';
import SafeAreaView from 'react-native-safe-area-view';
import PropTypes from 'prop-types';
import { Navigation } from 'react-native-navigation';
import { connect } from 'react-redux';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { getBackgroundColor } from 'ui/theme/general';
import { width, height } from 'libs/dimensions';

export default function withSafeAreaView(WrappedComponent) {
    class EnhancedComponent extends Component {
        static propTypes = {
            /** @ignore */
            theme: PropTypes.object.isRequired,
            /** @ignore */
            inactive: PropTypes.bool.isRequired,
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
            const { theme, inactive } = this.props;
            const { currentScreen } = this.state;
            return (
                <SafeAreaView
                    style={{
                        height,
                        width,
                        backgroundColor: inactive ? theme.body.bg : getBackgroundColor(currentScreen, theme, inactive),
                    }}
                >
                    <WrappedComponent {...this.props} />
                </SafeAreaView>
            );
        }
    }

    const mapStateToProps = (state) => ({
        theme: state.settings.theme,
        inactive: state.ui.inactive,
        isModalActive: state.ui.isModalActive,
    });

    return hoistNonReactStatics(connect(mapStateToProps)(EnhancedComponent), WrappedComponent);
}
