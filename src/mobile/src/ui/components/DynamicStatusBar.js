import React, { Component } from 'react';
import { StatusBar } from 'react-native';
import PropTypes from 'prop-types';
import tinycolor from 'tinycolor2';
import timer from 'react-native-timer';
import { Navigation } from 'react-native-navigation';
import { isAndroid, isIPhoneX } from 'libs/device';
import { rgbToHex } from 'shared-modules/libs/utils';

class DynamicStatusBar extends Component {
    static propTypes = {
        /** Status bar background color */
        backgroundColor: PropTypes.string,
        /** Determines whether modal is open */
        isModalActive: PropTypes.bool,
    };

    componentWillMount() {
        Navigation.events().registerComponentDidAppearListener(() => {
            this.resetStatusBarColor();
        });
    }

    componentDidMount() {
        this.resetStatusBarColor();
    }

    componentWillReceiveProps(newProps) {
        const { isModalActive } = this.props;
        if (!isAndroid) {
            return;
        }
        if (!isModalActive && newProps.isModalActive) {
            timer.setTimeout('timeout', () => this.resetStatusBarColor(), 50);
            if (isAndroid) {
                this.resetStatusBarColor();
            }
        }
        if (isModalActive && !newProps.isModalActive) {
            timer.setTimeout('timeout', () => this.resetStatusBarColor(), 450);
            if (isAndroid) {
                this.resetStatusBarColor();
            }
        }
    }

    getStatusBarStyle() {
        const { backgroundColor } = this.props;
        if (isIPhoneX) {
            return 'light-content';
        }
        return tinycolor(backgroundColor).isDark() ? 'light-content' : 'dark-content';
    }

    resetStatusBarColor() {
        const { backgroundColor } = this.props;
        if (backgroundColor) {
            StatusBar.setBackgroundColor(rgbToHex(backgroundColor), false);
        }
    }

    render() {
        const { backgroundColor } = this.props;
        const statusBarStyle = this.getStatusBarStyle();

        return <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor} translucent animated={false} />;
    }
}
export default DynamicStatusBar;
