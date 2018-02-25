import React, { PureComponent } from 'react';
import { StatusBar } from 'react-native';
import PropTypes from 'prop-types';

class DynamicStatusBar extends PureComponent {
    static propTypes = {
        textColor: PropTypes.string.isRequired,
        backgroundColor: PropTypes.string.isRequired,
    };
    render() {
        const { textColor, backgroundColor } = this.props;
        const statusBarStyle = textColor === 'white' ? 'light-content' : 'dark-content';

        return <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor} translucent />;
    }
}

export default DynamicStatusBar;
