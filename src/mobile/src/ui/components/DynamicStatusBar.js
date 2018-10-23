import React, { Component } from 'react';
import { StatusBar } from 'react-native';
import PropTypes from 'prop-types';
import tinycolor from 'tinycolor2';
import { Navigation } from 'react-native-navigation';
import { isAndroid } from 'libs/device';
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
        currentRoute: PropTypes.string.isRequired,
    };

    componentWillMount() {
        Navigation.events().registerComponentDidAppearListener(() => {
            this.resetStatusBar(this.props.currentRoute);
        });
    }

    componentWillReceiveProps(newProps) {
        const { isModalActive, currentRoute } = this.props;
        // Reset StatusBar on modal open/close. Prevents residual status bar colour change when an alert is open during modal activity toggle
        if (isModalActive !== newProps.isModalActive) {
            this.resetStatusBar(currentRoute);
            timer.setTimeout('resetStatusBarOnModalActivity', () => this.resetStatusBar(currentRoute), 400);
        }
        if (currentRoute !== newProps.currentRoute) {
            timer.setTimeout('resetStatusBarOnRouteChange', () => this.resetStatusBar(newProps.currentRoute), 400);
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
        const backgroundColor = getBackgroundColor(currentRoute, theme, false, inactive);
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
        const { currentRoute } = this.props;
        const statusBarStyle = this.getStatusBarStyle(this.getStatusBarColor(currentRoute));
        return (
            <StatusBar
                barStyle={statusBarStyle}
                backgroundColor={this.getStatusBarColor(currentRoute)}
                translucent
                animated={false}
            />
        );
    }
}

const mapStateToProps = (state) => ({
    inactive: state.ui.inactive,
    theme: state.settings.theme,
    isModalActive: state.ui.isModalActive,
    currentRoute: state.ui.currentRoute,
});

export default connect(mapStateToProps)(DynamicStatusBar);
