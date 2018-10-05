import React, { PureComponent } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import StatefulDropdownAlert from 'ui/components/StatefulDropdownAlert';
import hoistNonReactStatics from 'hoist-non-react-statics';

export default function withDropdownAlert(WrappedComponent) {
    class EnhancedComponent extends PureComponent {
        static propTypes = {
            /** @ignore */
            theme: PropTypes.object.isRequired,
            /** @ignore */
            isModalActive: PropTypes.bool.isRequired,
        };

        render() {
            return (
                <View style={{ flex: 1 }}>
                    <WrappedComponent {...this.props} />
                    {!this.props.isModalActive && <StatefulDropdownAlert textColor="white" />}
                </View>
            );
        }
    }

    const mapStateToProps = (state) => ({
        theme: state.settings.theme,
        isModalActive: state.ui.isModalActive,
    });

    return hoistNonReactStatics(connect(mapStateToProps)(EnhancedComponent), WrappedComponent);
}
