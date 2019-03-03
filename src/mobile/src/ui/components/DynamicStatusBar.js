import last from 'lodash/last';
import React, { Component } from 'react';
import { StatusBar } from 'react-native';
import PropTypes from 'prop-types';
import tinycolor from 'tinycolor2';
import { isAndroid } from 'libs/device';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { rgbToHex } from 'shared-modules/libs/utils';
import timer from 'react-native-timer';
import { connect } from 'react-redux';
import { getBackgroundColor } from 'ui/theme/general';

class DynamicStatusBar extends Component {
    static propTypes = {
        /** @ignore */
        inactive: PropTypes.bool.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        isModalActive: PropTypes.bool.isRequired,
        /** @ignore */
        navStack: PropTypes.array,
    };

    componentWillReceiveProps(newProps) {
        const { isModalActive, navStack } = this.props;
        // Reset StatusBar on modal open/close. Prevents residual status bar colour change when an alert is open during modal activity toggle
        if (isModalActive !== newProps.isModalActive) {
            this.resetStatusBar(last(navStack));
            timer.setTimeout('resetStatusBarOnModalActivity', () => this.resetStatusBar(last(navStack)), 400);
        }
        if (last(navStack) !== last(newProps.navStack)) {
            timer.setTimeout('resetStatusBarOnRouteChange', () => this.resetStatusBar(last(newProps.navStack)), 400);
        }
    }

    componentWillUnmount() {
        timer.clearTimeout('resetStatusBarOnRouteChange');
        timer.clearTimeout('resetStatusBarOnModalActivity');
    }

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
        const backgroundColor = getBackgroundColor(currentRoute, theme, inactive);
        if (backgroundColor) {
            return rgbToHex(backgroundColor);
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
        return (
            <StatusBar
                barStyle={statusBarStyle}
                backgroundColor={this.getStatusBarColor(last(navStack))}
                animated={false}
                translucent
            />
        );
    }
}

const mapStateToProps = (state) => ({
    inactive: state.ui.inactive,
    theme: getThemeFromState(state),
    isModalActive: state.ui.isModalActive,
    navStack: state.wallet.navStack,
});

export default connect(mapStateToProps)(DynamicStatusBar);
