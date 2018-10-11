import React, { Component } from 'react';
import { StatusBar } from 'react-native';
import PropTypes from 'prop-types';
import tinycolor from 'tinycolor2';
import timer from 'react-native-timer';
import { Navigation } from 'react-native-navigation';
import { isAndroid, isIPhoneX } from 'libs/device';
import { rgbToHex } from 'shared-modules/libs/utils';
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
        if (!isModalActive && newProps.isModalActive) {
            if (isAndroid) {
                timer.setTimeout('timeout', () => this.resetStatusBarColor(currentRoute), 50);
            }
        }
        if (isModalActive && !newProps.isModalActive) {
            if (isAndroid) {
                timer.setTimeout('timeout', () => this.resetStatusBarColor(currentRoute), 450);
            }
        }
        if (isAndroid && currentRoute !== newProps.currentRoute) {
            this.resetStatusBarColor(newProps.currentRoute);
        }
    }

    getStatusBarColor(currentRoute) {
        const { theme, inactive } = this.props;
        const backgroundColor = getBackgroundColor(currentRoute, theme, false, inactive);
        if (backgroundColor) {
            return rgbToHex(backgroundColor);
        }
    }

    getStatusBarStyle() {
        if (isIPhoneX) {
            return 'light-content';
        }
        return tinycolor(this.getStatusBarColor(this.props.currentRoute)).isDark() ? 'light-content' : 'dark-content';
    }

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
