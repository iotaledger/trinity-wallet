import last from 'lodash/last';
import React, { Component } from 'react';
import { StatusBar } from 'react-native';
import PropTypes from 'prop-types';
import tinycolor from 'tinycolor2';
import { isAndroid } from 'libs/device';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { rgbToHex } from 'shared-modules/libs/utils';
import { connect } from 'react-redux';
import { getBorderColor } from 'ui/theme/general';

class DynamicStatusBar extends Component {
    static propTypes = {
        /** @ignore */
        inactive: PropTypes.bool.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        navStack: PropTypes.array,
    };

    /**
     * Returns status bar colour dependent on current route
     *
     * @method getStatusBarColor
     * @param {string} currentRoute
     *
     * @returns {string} Hex colour string
     */
    getStatusBarColor(currentRoute) {
        const { theme, inactive } = this.props;
        const borderColor = getBorderColor(currentRoute, theme, inactive);
        if (borderColor) {
            return rgbToHex(borderColor);
        }
    }

    /**
     * Returns status bar style (light or dark) dependent on theme
     *
     * @method getStatusBarStyle
     *
     * @returns {string}
     */
    getStatusBarStyle(statusBarColor) {
        return tinycolor(statusBarColor).isDark() ? 'light-content' : 'dark-content';
    }

    /**
     * Resets status bar colour depending on current route
     *
     * @method resetStatusBar
     * @param {string} currentRoute
     *
     */
    resetStatusBar(currentRoute) {
        const statusBarColor = this.getStatusBarColor(currentRoute);
        if (statusBarColor) {
            if (isAndroid) {
                StatusBar.setBackgroundColor(statusBarColor, false);
            }
            StatusBar.setBarStyle(this.getStatusBarStyle(statusBarColor), false);
        }
    }

    render() {
        const { navStack } = this.props;
        const statusBarStyle = this.getStatusBarStyle(this.getStatusBarColor(last(navStack)));
        return <StatusBar barStyle={statusBarStyle} backgroundColor="transparent" animated={false} translucent />;
    }
}

const mapStateToProps = (state) => ({
    inactive: state.ui.inactive,
    theme: getThemeFromState(state),
    navStack: state.wallet.navStack,
});

export default connect(mapStateToProps)(DynamicStatusBar);
