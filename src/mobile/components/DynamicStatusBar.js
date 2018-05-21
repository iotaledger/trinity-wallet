import React, { PureComponent } from 'react';
import { StatusBar } from 'react-native';
import PropTypes from 'prop-types';
import tinycolor from 'tinycolor2';
import timer from 'react-native-timer';
import { isAndroid, isIPhoneX } from '../utils/device';

class DynamicStatusBar extends PureComponent {
    static propTypes = {
        /** Status bar background color */
        backgroundColor: PropTypes.string.isRequired,
        /** Determines whether modal is open */
        isModalActive: PropTypes.bool,
    };

    componentWillReceiveProps(newProps) {
        const { isModalActive } = this.props;
        if (!isAndroid) {
            return;
        }
        if (!isModalActive && newProps.isModalActive) {
            timer.setTimeout('timeout', () => this.resetStatusBarColor(), 50);
        }
        if (isModalActive && !newProps.isModalActive) {
            timer.setTimeout('timeout', () => this.resetStatusBarColor(), 450);
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
        StatusBar.setBackgroundColor(backgroundColor);
    }

    render() {
        const { backgroundColor } = this.props;
        const statusBarStyle = this.getStatusBarStyle();

        return <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor} translucent animated={false} />;
    }
}
export default DynamicStatusBar;
