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
            this.resetStatusBarColor(this.props.currentRoute);
        });
    }

    componentWillReceiveProps(newProps) {
        const { isModalActive, currentRoute } = this.props;
        if (!isAndroid) {
            return;
        }
        if (isModalActive !== newProps.isModalActive) {
            timer.setTimeout('timeout', () => this.resetStatusBarColor(currentRoute), 200);
        }
        if (currentRoute !== newProps.currentRoute) {
            timer.setTimeout('timeout', () => this.resetStatusBarColor(newProps.currentRoute), 400);
        }
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
    getStatusBarStyle() {
        return tinycolor(this.getStatusBarColor(this.props.currentRoute)).isDark() ? 'light-content' : 'dark-content';
    }

    /**
     * Resets status bar colour depending on current route
     *
     * @method resetStatusBarColor
     * @param {string} currentRoute
     *
     */
    resetStatusBarColor(currentRoute) {
        const statusBarColor = this.getStatusBarColor(currentRoute);
        if (statusBarColor) {
            StatusBar.setBackgroundColor(statusBarColor, false);
        }
    }

    render() {
        const statusBarStyle = this.getStatusBarStyle();
        return (
            <StatusBar
                barStyle={statusBarStyle}
                backgroundColor={this.getStatusBarColor(this.props.currentRoute)}
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
