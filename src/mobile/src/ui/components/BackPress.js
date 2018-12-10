import last from 'lodash/last';
import React, { Component } from 'react';
import { BackHandler, ToastAndroid } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { navigator } from 'libs/navigation';
import RNExitApp from 'react-native-exit-app';
import i18next from 'shared-modules/libs/i18next.js';
import { setSetting } from 'shared-modules/actions/wallet';
import { setLoginRoute } from 'shared-modules/actions/ui';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { isAndroid } from 'libs/device';

const mapDispatchToProps = {
    setSetting,
    setLoginRoute,
};

const mapStateToProps = (state) => ({
    currentSetting: state.wallet.currentSetting,
    currentRoute: last(state.wallet.navStack),
    loginRoute: state.ui.loginRoute,
});

/**
 * Handles back button events on Android by wrapping a component
 * @param {Component} C Component to be wrapped
 * @return {Component} A wrapped component
 */
export default function withBackPress(C) {
    class EnhancedComponent extends Component {
        static propTypes = {
            /** Component ID */
            componentId: PropTypes.string.isRequired,
            /** @ignore */
            setSetting: PropTypes.func.isRequired,
            /** @ignore */
            currentSetting: PropTypes.string.isRequired,
            /** @ignore */
            currentRoute: PropTypes.string.isRequired,
            /** @ignore */
            loginRoute: PropTypes.string.isRequired,
            /** @ignore */
            setLoginRoute: PropTypes.func.isRequired,
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
                    break;
                case 'modeSelection':
                case 'themeCustomisation':
                case 'currencySelection':
                case 'languageSelection':
                case 'accountManagement':
                case 'securitySettings':
                case 'advancedSettings':
                case 'about':
                    this.props.setSetting('mainSettings');
                    break;
                case 'nodeSelection':
                case 'addCustomNode':
                case 'manualSync':
                case 'snapshotTransition':
                case 'pow':
                case 'autoPromotion':
                    this.props.setSetting('advancedSettings');
                    break;
                case 'viewSeed':
                case 'viewAddresses':
                case 'editAccountName':
                case 'deleteAccount':
                case 'addNewAccount':
                case 'exportSeedVault':
                    this.props.setSetting('accountManagement');
                    break;
                case 'addExistingSeed':
                    this.props.setSetting('addNewAccount');
                    break;
                case 'changePassword':
                    this.props.setSetting('securitySettings');
                    break;
                default:
                    break;
            }
        }

        withBackPressNavigateNodeOptions(loginRoute) {
            switch (loginRoute) {
                case 'complete2FA':
                case 'nodeOptions':
                    this.props.setLoginRoute('login');
                    break;
                case 'nodeSelection':
                case 'customNode':
                    this.props.setLoginRoute('nodeOptions');
                    break;
                default:
                    break;
            }
        }

        /**
         * Choose appropriate action on back press
         *
         * @method handleBackPress
         */
        handleBackPress = () => {
            const { currentSetting, currentRoute, loginRoute } = this.props;
            switch (currentRoute) {
                case 'home':
                    this.withBackPressNavigateSettings(currentSetting);
                    break;
                case 'languageSetup':
                case 'onboardingComplete':
                case 'login':
                    if (loginRoute !== 'login') {
                        this.withBackPressNavigateNodeOptions(loginRoute);
                        break;
                    }
                    this.withBackPressCloseApp();
                    break;
                default:
                    this.withBackPressPopRoute();
                    break;
            }
            return true;
        };

        render() {
            return <C {...this.props} />;
        }
    }

    return connect(mapStateToProps, mapDispatchToProps)(EnhancedComponent);
}
