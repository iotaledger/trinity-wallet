import React, { PureComponent } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getThemeFromState } from 'shared-modules/selectors/global';
import StatefulDropdownAlert from 'ui/components/StatefulDropdownAlert';

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
                    {!this.props.isModalActive && <StatefulDropdownAlert />}
                </View>
            );
        }
    }

    const mapStateToProps = (state) => ({
        theme: getThemeFromState(state),
        isModalActive: state.ui.isModalActive,
    });

    return connect(mapStateToProps)(EnhancedComponent);
}
