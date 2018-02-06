import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { translate } from 'react-i18next';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import authenticator from 'authenticator';
import PropTypes from 'prop-types';
import Modal from 'react-native-modal';
import KeepAwake from 'react-native-keep-awake';
import { getTwoFactorAuthKeyFromKeychain } from '../util/keychain';
import { StyleSheet, View, Text } from 'react-native';
import { StyleSheet, View, Text, Keyboard, AppState } from 'react-native';
import FingerprintScanner from 'react-native-fingerprint-scanner';
import { setFullNode } from 'iota-wallet-shared-modules/actions/settings';
import { getVersion, getBuildNumber } from 'react-native-device-info';
import { setPassword, setReady, setUserActivity, setSetting } from 'iota-wallet-shared-modules/actions/tempAccount';
import { setLoginPasswordField } from 'iota-wallet-shared-modules/actions/ui';
import { changeHomeScreenRoute } from 'iota-wallet-shared-modules/actions/home';
import { changeIotaNode } from 'iota-wallet-shared-modules/libs/iota';
import { getSelectedAccountViaSeedIndex } from 'iota-wallet-shared-modules/selectors/account';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import whiteArrowLeftImagePath from 'iota-wallet-shared-modules/images/arrow-left-white.png';
import blackArrowLeftImagePath from 'iota-wallet-shared-modules/images/arrow-left-black.png';
import whiteTickImagePath from 'iota-wallet-shared-modules/images/tick-white.png';
import blackTickImagePath from 'iota-wallet-shared-modules/images/tick-black.png';
import DynamicStatusBar from '../components/dynamicStatusBar';
import OnboardingButtons from '../components/onboardingButtons';
import NodeSelection from '../components/nodeSelection';
import EnterPasswordOnLogin from '../components/enterPasswordOnLogin';
import Enter2FA from '../components/enter2FA';
import StatefulDropdownAlert from './statefulDropdownAlert';
import keychain from '../util/keychain';
import GENERAL from '../theme/general';
import { migrate } from '../../shared/actions/app';
import { persistor, persistConfig } from '../store';
import { width, height } from '../util/dimensions';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: GENERAL.borderRadius,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        paddingVertical: height / 18,
        width: width / 1.15,
    },
    questionText: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 27.6,
        paddingBottom: height / 40,
    },
    infoText: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 27.6,
        paddingBottom: height / 16,
    },
});

class Login extends Component {
    static propTypes = {
        firstUse: PropTypes.bool.isRequired,
        hasErrorFetchingAccountInfoOnLogin: PropTypes.bool.isRequired,
        selectedAccount: PropTypes.object.isRequired,
        fullNode: PropTypes.string.isRequired,
        availablePoWNodes: PropTypes.array.isRequired,
        versions: PropTypes.object.isRequired,
        setPassword: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        backgroundColor: PropTypes.string.isRequired,
        positiveColor: PropTypes.string.isRequired,
        negativeColor: PropTypes.string.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        key2FA: PropTypes.string.isRequired,
        is2FAEnabled: PropTypes.bool.isRequired,
        setUserActivity: PropTypes.func.isRequired,
        isFingerprintEnabled: PropTypes.bool.isRequired,
        migrate: PropTypes.func.isRequired,
        setLoginPasswordField: PropTypes.func.isRequired,
        password: PropTypes.string.isRequired,
        setFullNode: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
        navigator: PropTypes.object.isRequired,
    };

    constructor() {
        super();

        this.state = {
            isModalVisible: false,
            changingNode: false,
            completing2FA: false,
            appState: AppState.currentState,
        };

        this.onComplete2FA = this.onComplete2FA.bind(this);
        this.onLoginPress = this.onLoginPress.bind(this);
        this.onBackPress = this.onBackPress.bind(this);
        this.navigateToNodeSelection = this.navigateToNodeSelection.bind(this);
    }

    componentDidMount() {
        this.checkForUpdates();
        KeepAwake.deactivate();
        this.props.setUserActivity({ inactive: false });
    }

    componentWillReceiveProps(newProps) {
        if (newProps.hasErrorFetchingAccountInfoOnLogin && !this.props.hasErrorFetchingAccountInfoOnLogin) {
            this.showModal();
        }
    }

    onLoginPress(password) {
        const { t, is2FAEnabled } = this.props;

        if (!password) {
            this.props.generateAlert('error', t('emptyPassword'), t('emptyPasswordExplanation'));
        } else {
            keychain
                .get()
                .then(credentials => {
                    const hasAccountsData = get(credentials, 'data.accounts');
                    const hasCorrectPassword = get(credentials, 'password') === password;

                    if (hasAccountsData && hasCorrectPassword) {
                        this.props.setPassword(password);
                        this.props.setLoginPasswordField('');
                        if (!is2FAEnabled) {
                            this.navigateToLoading();
                        } else {
                            this.setState({ completing2FA: true });
                        }
                    } else {
                        this.props.generateAlert(
                            'error',
                            t('global:unrecognisedPassword'),
                            t('global:unrecognisedPasswordExplanation'),
                        );
                    }
                })
                .catch(err => console.log(err)); // Dropdown
        }
    }

    onComplete2FA(token) {
        const { firstUse, selectedAccount } = this.props;

        if (token) {
            getTwoFactorAuthKeyFromKeychain()
                .then(key => {
                    const legit = authenticator.verifyToken(key, token);

                    if (legit) {
                        if (firstUse) {
                            this.navigateToLoading();
                        } else {
                            const addresses = get(selectedAccount, 'addresses');
                            if (!isEmpty(addresses)) {
                                this.navigateToLoading();
                            } else {
                                this.navigateToHome();
                            }
                        }

                        this.setState({ completing2FA: false });
                    } else {
                        this.props.generateAlert('error', 'Wrong Code', 'The code you entered is not correct');
                    }
                })
                .catch(err => console.error(err)); // Generate an alert here.
        } else {
            this.props.generateAlert('error', 'Empty code', 'The code you entered is empty');
        }
    }

    onBackPress() {
        this.setState({ completing2FA: false });
    }

    activateFingerPrintScanner() {
        const { t, is2FAEnabled } = this.props;
        FingerprintScanner.authenticate({ description: t('fingerprintSetup:instructionsLogin') })
            .then(() => {
                keychain
                    .get()
                    .then(credentials => {
                        const password = get(credentials, 'password');
                        this.props.setPassword(password);
                        if (!is2FAEnabled) {
                            this.navigateToLoading();
                        } else {
                            this.setState({ completing2FA: true });
                        }
                    })
                    .catch(err => console.log(err));
            })
            .catch(() => {
                this.props.generateAlert(
                    'error',
                    t('fingerprintSetup:fingerprintAuthFailed'),
                    t('fingerprintSetup:fingerprintAuthFailedExplanation'),
                );
            });
    }

    checkForUpdates() {
        const latestVersion = getVersion();
        const latestBuildNumber = getBuildNumber();
        const { versions } = this.props;
        const currentVersion = get(versions, 'version');
        const currentBuildNumber = get(versions, 'buildNumber');

        if (latestVersion !== currentVersion || latestBuildNumber !== currentBuildNumber) {
            this.props.migrate({ version: latestVersion, buildNumber: latestBuildNumber }, persistConfig, persistor);
        }
    }

    showModal = () => this.setState({ isModalVisible: true });

    hideModal = () => this.setState({ isModalVisible: false });

    navigateToNodeSelection() {
        this.hideModal();
        this.setState({ changingNode: true });
    }

    navigateToLoading() {
        this.props.navigator.push({
            screen: 'loading',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                screenBackgroundColor: this.props.backgroundColor,
            },
            animated: false,
            overrideBackPress: true,
        });
    }

    renderModalContent = () => {
        const { backgroundColor, secondaryBackgroundColor } = this.props;
        const textColor = { color: secondaryBackgroundColor };
        return (
            <View style={{ width: width / 1.15, alignItems: 'center', backgroundColor: backgroundColor }}>
                <View style={styles.modalContent}>
                    <Text style={[styles.questionText, textColor]}>Cannot connect to IOTA node.</Text>
                    <Text style={[styles.infoText, textColor]}>Do you want to select a different node?</Text>
                    <OnboardingButtons
                        onLeftButtonPress={() => this.hideModal()}
                        onRightButtonPress={() => this.navigateToNodeSelection()}
                        leftText={'NO'}
                        rightText={'YES'}
                    />
                </View>
            </View>
        );
    };

    render() {
        const {
            backgroundColor,
            positiveColor,
            negativeColor,
            secondaryBackgroundColor,
            password,
            isFingerprintEnabled,
        } = this.props;
        const textColor = { color: secondaryBackgroundColor };
        const arrowLeftImagePath =
            secondaryBackgroundColor === 'white' ? whiteArrowLeftImagePath : blackArrowLeftImagePath;
        const tickImagePath = secondaryBackgroundColor === 'white' ? whiteTickImagePath : blackTickImagePath;
        return (
            <View style={[styles.container, { backgroundColor }]}>
                <DynamicStatusBar textColor={secondaryBackgroundColor} />
                {!this.state.changingNode &&
                    !this.state.completing2FA && (
                        <EnterPasswordOnLogin
                            backgroundColor={backgroundColor}
                            negativeColor={negativeColor}
                            positiveColor={positiveColor}
                            onLoginPress={this.onLoginPress}
                            navigateToNodeSelection={this.navigateToNodeSelection}
                            secondaryBackgroundColor={secondaryBackgroundColor}
                            textColor={textColor}
                            setLoginPasswordField={pword => this.props.setLoginPasswordField(pword)}
                            password={password}
                            activateFingerPrintScanner={() => this.activateFingerPrintScanner()}
                            isFingerprintEnabled={isFingerprintEnabled}
                        />
                    )}
                {!this.state.changingNode &&
                    this.state.completing2FA && (
                        <Enter2FA
                            negativeColor={negativeColor}
                            positiveColor={positiveColor}
                            onComplete2FA={this.onComplete2FA}
                            onBackPress={this.onBackPress}
                            navigateToNodeSelection={this.navigateToNodeSelection}
                            secondaryBackgroundColor={secondaryBackgroundColor}
                            textColor={textColor}
                        />
                    )}
                {this.state.changingNode && (
                    <View>
                        <View style={{ flex: 0.8 }} />
                        <View style={{ flex: 4.62 }}>
                            <NodeSelection
                                setNode={selectedNode => {
                                    changeIotaNode(selectedNode);
                                    this.props.setFullNode(selectedNode);
                                }}
                                node={this.props.fullNode}
                                nodes={this.props.availablePoWNodes}
                                backPress={() => this.setState({ changingNode: false })}
                                textColor={textColor}
                                tickImagePath={tickImagePath}
                                arrowLeftImagePath={arrowLeftImagePath}
                                secondaryBackgroundColor={secondaryBackgroundColor}
                            />
                        </View>
                        <View style={{ flex: 0.2 }} />
                    </View>
                )}
                <StatefulDropdownAlert />
                <Modal
                    animationIn={'bounceInUp'}
                    animationOut={'bounceOut'}
                    animationInTiming={1000}
                    animationOutTiming={200}
                    backdropTransitionInTiming={500}
                    backdropTransitionOutTiming={200}
                    backdropColor={'#132d38'}
                    backdropOpacity={0.6}
                    style={{ alignItems: 'center' }}
                    isVisible={this.state.isModalVisible}
                    onBackButtonPress={() => this.setState({ isModalVisible: false })}
                >
                    {this.renderModalContent()}
                </Modal>
            </View>
        );
    }
}

const mapStateToProps = state => ({
    firstUse: state.account.firstUse,
    selectedAccount: getSelectedAccountViaSeedIndex(state.tempAccount.seedIndex, state.account.accountInfo),
    fullNode: state.settings.fullNode,
    availablePoWNodes: state.settings.availablePoWNodes,
    hasErrorFetchingAccountInfoOnLogin: state.tempAccount.hasErrorFetchingAccountInfoOnLogin,
    backgroundColor: state.settings.theme.backgroundColor,
    positiveColor: state.settings.theme.positiveColor,
    negativeColor: state.settings.theme.negativeColor,
    secondaryBackgroundColor: state.settings.theme.secondaryBackgroundColor,
    is2FAEnabled: state.account.is2FAEnabled,
    isFingerprintEnabled: state.account.isFingerprintEnabled,
    key2FA: state.account.key2FA,
    versions: state.app.versions,
    accountInfo: state.account.accountInfo,
    password: state.ui.loginPasswordFieldText,
});

const mapDispatchToProps = {
    generateAlert,
    setPassword,
    setReady,
    setFullNode,
    changeHomeScreenRoute,
    setSetting,
    setUserActivity,
    migrate,
    setLoginPasswordField,
};

export default translate(['login', 'global', 'fingerprintSetup'])(connect(mapStateToProps, mapDispatchToProps)(Login));
