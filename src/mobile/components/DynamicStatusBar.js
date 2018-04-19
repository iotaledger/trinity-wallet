import React, { PureComponent } from 'react';
import { View, StatusBar } from 'react-native';
import PropTypes from 'prop-types';
import tinycolor from 'tinycolor2';
import timer from 'react-native-timer';
import { isAndroid } from '../utils/device';

class DynamicStatusBar extends PureComponent {
    static propTypes = {
        /** Status bar background color */
        backgroundColor: PropTypes.string.isRequired,
        /** Determines whether modal is open */
        isModalActive: PropTypes.bool.isRequired,
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
            this.resetStatusBarColor();
        }
    }

    resetStatusBarColor() {
        const { backgroundColor } = this.props;
        StatusBar.setBackgroundColor(backgroundColor);
    }

    render() {
        const { backgroundColor } = this.props;
        const statusBarStyle = tinycolor(backgroundColor).isDark() ? 'light-content' : 'dark-content';

        return (
            <View style={{ backgroundColor: 'black', opacity: 0.6 }}>
                <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor} translucent animated={false} />
            </View>
        );
    }
}
export default DynamicStatusBar;
