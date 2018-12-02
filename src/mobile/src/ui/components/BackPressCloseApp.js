import React, { Component } from 'react';
import { ToastAndroid, BackHandler } from 'react-native';
import { Navigation } from 'react-native-navigation';
import RNExitApp from 'react-native-exit-app';
import { withNamespaces } from 'react-i18next';
import PropTypes from 'prop-types';
import { isAndroid } from 'libs/device';

export default () => (C) => {
    class WithBackPressCloseApp extends Component {
        constructor(props) {
            super(props);
            if (isAndroid) {
                Navigation.events().bindComponent(this);
            }
        }

        /**
         * Remove back handler
         *
         * @method componentDidDisappear
         */
        componentDidDisappear() {
            if (this.backHandler) {
                this.backHandler.remove();
            }
        }

        /**
         * Add back handler
         *
         * @method componentDidAppear
         */
        componentDidAppear() {
            this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
        }

        /**
         * On back press, display alert. On second back press, close app.
         *
         * @method handleBackPress
         */
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
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    return withNamespaces(['global'])(WithBackPressCloseApp);
};
