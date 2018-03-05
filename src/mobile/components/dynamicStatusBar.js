import React, { PureComponent } from 'react';
import { StatusBar } from 'react-native';
import PropTypes from 'prop-types';
import tinycolor from 'tinycolor2';

class DynamicStatusBar extends PureComponent {
    static propTypes = {
        backgroundColor: PropTypes.string.isRequired,
    };
    render() {
        const { backgroundColor } = this.props;
        const statusBarStyle = tinycolor(backgroundColor).isDark() ? 'light-content' : 'light-content';

        return <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor} translucent />;
    }
}

export default DynamicStatusBar;
