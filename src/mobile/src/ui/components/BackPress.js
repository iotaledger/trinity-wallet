import last from 'lodash/last';
import React, { Component } from 'react';
import { BackHandler, ToastAndroid } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { navigator } from 'libs/navigation';
import RNExitApp from 'react-native-exit-app';
import i18next from 'shared-modules/libs/i18next.js';
import { setSetting } from 'shared-modules/actions/wallet';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { isAndroid } from 'libs/device';

const mapDispatchToProps = {
    setSetting,
};

const mapStateToProps = (state) => ({
    currentSetting: state.wallet.currentSetting,
    currentRoute: last(state.wallet.navStack),
});

/**
 * Handles back button events on Android by wrapping a component
 * @param {Component} C Component to be wrapped
 * @return {Component} A wrapped component
 */
export default function withBackPress(C) {
    class EnhancedComponent extends Component {
        static propTypes = {
            /** @ignore */
            setSetting: PropTypes.func.isRequired,
            /** @ignore */
            currentSetting: PropTypes.string.isRequired,
            /** @ignore */
            currentRoute: PropTypes.string.isRequired,
            /** Component ID */
            componentId: PropTypes.string.isRequired,
        };
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
         * On back press, pop current route
         *
         * @method withBackPressPopRoute
         */
        withBackPressPopRoute() {
            navigator.pop(this.props.componentId);
        }

        /**
         * On back press, display alert. On second back press, close app
         *
         * @method withBackPressCloseApp
         */
        withBackPressCloseApp() {
            if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()) {
                RNExitApp.exitApp();
            }
            this.lastBackPressed = Date.now();
            ToastAndroid.show(i18next.t('global:pressBackAgain'), ToastAndroid.SHORT);
        }

        /**
         * On back press, navigate to appropriate setting menu
         *
         * @method withBackPressNavigateSettings
         */
        withBackPressNavigateSettings(currentSetting) {
            switch (currentSetting) {
                case 'mainSettings':
                    this.withBackPressCloseApp();
                    return true;
                case 'modeSelection':
                case 'themeCustomisation':
                case 'currencySelection':
                case 'languageSelection':
                case 'accountManagement':
                case 'securitySettings':
                case 'advancedSettings':
                case 'about':
                    this.props.setSetting('mainSettings');
                    return true;
                case 'nodeSelection':
                case 'addCustomNode':
                case 'manualSync':
                case 'snapshotTransition':
                case 'pow':
                case 'autoPromotion':
                    this.props.setSetting('advancedSettings');
                    return true;
                case 'viewSeed':
                case 'viewAddresses':
                case 'editAccountName':
                case 'deleteAccount':
                case 'addNewAccount':
                    this.props.setSetting('accountManagement');
                    return true;
                case 'addExistingSeed':
                    this.props.setSetting('addNewAccount');
                    return true;
                case 'changePassword':
                    this.props.setSetting('securitySettings');
                    return true;
                default:
                    break;
            }
            return true;
        }

        /**
         * Choose appropriate action on back press
         *
         * @method handleBackPress
         */
        handleBackPress = () => {
            const { currentSetting, currentRoute } = this.props;
            switch (currentRoute) {
                case 'home':
                    return this.withBackPressNavigateSettings(currentSetting);
                case 'languageSetup':
                case 'onboardingComplete':
                case 'login':
                    return this.withBackPressCloseApp();
                default:
                    return this.withBackPressPopRoute();
            }
        };

        render() {
            return <C {...this.props} />;
        }
    }

    return connect(mapStateToProps, mapDispatchToProps)(EnhancedComponent);
}
