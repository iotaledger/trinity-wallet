import React, { Component } from 'react';
import { BackHandler, ToastAndroid } from 'react-native';
import RNExitApp from 'react-native-exit-app';
import { setSetting } from 'iota-wallet-shared-modules/actions/tempAccount';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const mapDispatchToProps = {
    setSetting,
};

const mapStateToProps = state => ({
    currentSetting: state.tempAccount.currentSetting,
});

export default () => C => {
    class WithBackPress extends Component {
        constructor(props) {
            super(props);
            this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
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

        pressBackTwiceToCloseApp() {
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
                    this.pressBackTwiceToCloseApp();
                    return true;
                case 'mode':
                case 'themeCustomisation':
                case 'currencySelection':
                case 'languageSelection':
                case 'accountManagement':
                case 'changePassword':
                case 'securitySettings':
                case 'advancedSettings':
                    this.props.setSetting('mainSettings');
                    return true;
                case 'nodeSelection':
                case 'addCustomNode':
                case 'manualSync':
                case 'snapshotTransition':
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
        navigator: PropTypes.object.isRequired,
        setSetting: PropTypes.func.isRequired,
        currentSetting: PropTypes.string.isRequired,
        t: PropTypes.func.isRequired,
    };

    return connect(mapStateToProps, mapDispatchToProps)(WithBackPress);
};
