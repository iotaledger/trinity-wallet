import { translate } from 'react-i18next';
import React, { Component } from 'react';
import { StatusBar } from 'react-native';
import { connect } from 'react-redux';

class DynamicStatusBar extends Component {
    render() {
        const { textColor } = this.props;
        const statusBarStyle = textColor === 'white' ? 'light-content' : 'dark-content';

        return <StatusBar barStyle={statusBarStyle} />;
    }
}

export default DynamicStatusBar;
