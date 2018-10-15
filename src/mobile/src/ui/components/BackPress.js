import React, { Component } from 'react';
import { BackHandler, ToastAndroid } from 'react-native';
import { Navigation } from 'react-native-navigation';
import RNExitApp from 'react-native-exit-app';
import { setSetting } from 'shared-modules/actions/wallet';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { isAndroid } from 'libs/device';

const mapDispatchToProps = {
    setSetting,
};

const mapStateToProps = (state) => ({
    currentSetting: state.wallet.currentSetting,
});

/**
 * Handles back button events on Android by wrapping a component
 * @param {Component} C Component to be wrapped
 * @return {Component} A wrapped component
 */
export default () => (C) => {
    class WithBackPress extends Component {
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
         * @method handleBackPressFromMainSettings
         */
        handleBackPressFromMainSettings() {
            const { t } = this.props;
            if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()) {
                RNExitApp.exitApp();
            }
            this.lastBackPressed = Date.now();
            ToastAndroid.show(t('global:pressBackAgain'), ToastAndroid.SHORT);
        }

        handleBackPress = () => {
            const { currentSetting } = this.props;
            switch (currentSetting) {
                case 'mainSettings':
                    this.handleBackPressFromMainSettings();
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
        };

        render() {
            return <C {...this.props} />;
        }
    }

    WithBackPress.propTypes = {
        /** @ignore */
        setSetting: PropTypes.func.isRequired,
        /** Current setting */
        currentSetting: PropTypes.string.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    return connect(mapStateToProps, mapDispatchToProps)(WithBackPress);
};
