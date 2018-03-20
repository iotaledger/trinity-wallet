import React, { Component } from 'react';
import { ToastAndroid, BackHandler } from 'react-native';
import RNExitApp from 'react-native-exit-app';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { isAndroid } from '../util/device';

export default () => (C) => {
    class WithBackPressCloseApp extends Component {
        constructor(props) {
            super(props);

            if (isAndroid) {
                this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
            }
        }

        onNavigatorEvent(event) {
            switch (event.id) {
                case 'willAppear':
                    this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
                    break;
                case 'willDisappear':
                    this.backHandler.remove();
                    break;
                default:
                    break;
            }
        }

        handleBackPress = () => {
            const { t } = this.props;
            if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()) {
                RNExitApp.exitApp();
            }
            this.lastBackPressed = Date.now();
            ToastAndroid.show(t('global:pressBackAgain'), ToastAndroid.SHORT);
            return true;
        };

        render() {
            return <C {...this.props} />;
        }
    }

    WithBackPressCloseApp.propTypes = {
        t: PropTypes.func.isRequired,
        navigator: PropTypes.object.isRequired,
    };

    return translate(['global'])(WithBackPressCloseApp);
};
