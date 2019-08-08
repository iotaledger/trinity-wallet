import last from 'lodash/last';
import React, { PureComponent } from 'react';
import { StatusBar } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { getStatusBarStyle, getStatusBarColor } from 'ui/theme/general';

class DynamicStatusBar extends PureComponent {
    static propTypes = {
        /** @ignore */
        inactive: PropTypes.bool.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        navStack: PropTypes.array,
    };

    render() {
        const { navStack, theme, inactive } = this.props;
        const statusBarStyle = getStatusBarStyle(getStatusBarColor(last(navStack), theme, inactive));
        return <StatusBar barStyle={statusBarStyle} backgroundColor="transparent" animated={false} translucent />;
    }
}

const mapStateToProps = (state) => ({
    inactive: state.ui.inactive,
    theme: getThemeFromState(state),
    navStack: state.wallet.navStack,
});

export default connect(mapStateToProps)(DynamicStatusBar);
