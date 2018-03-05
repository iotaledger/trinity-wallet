import get from 'lodash/get';
import { translate } from 'react-i18next';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import authenticator from 'authenticator';
import PropTypes from 'prop-types';
import KeepAwake from 'react-native-keep-awake';
import { StyleSheet, View } from 'react-native';
import FingerprintScanner from 'react-native-fingerprint-scanner';
import { setFullNode } from 'iota-wallet-shared-modules/actions/settings';
import { getVersion, getBuildNumber } from 'react-native-device-info';
import { setPassword, setReady, setUserActivity, setSetting } from 'iota-wallet-shared-modules/actions/tempAccount';
import { setLoginPasswordField } from 'iota-wallet-shared-modules/actions/ui';
import { changeHomeScreenRoute } from 'iota-wallet-shared-modules/actions/home';
import { changeIotaNode } from 'iota-wallet-shared-modules/libs/iota';
import { getSelectedAccountViaSeedIndex } from 'iota-wallet-shared-modules/selectors/account';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import WithBackPressCloseApp from '../components/withBackPressCloseApp';
import DynamicStatusBar from '../components/dynamicStatusBar';
import NodeSelection from '../components/nodeSelection';
import EnterPasswordOnLogin from '../components/enterPasswordOnLogin';
import Enter2FA from '../components/enter2FA';
import StatefulDropdownAlert from './statefulDropdownAlert';
import keychain, { getPasswordFromKeychain, getTwoFactorAuthKeyFromKeychain } from '../util/keychain';
import { migrate } from '../../shared/actions/app';
import { persistor, persistConfig } from '../store';
import { width, height } from '../util/dimensions';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        fullNode: PropTypes.string.isRequired,
        availablePoWNodes: PropTypes.array.isRequired,
        versions: PropTypes.object.isRequired,
        setPassword: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        body: PropTypes.object.isRequired,
        positive: PropTypes.object.isRequired,
        negative: PropTypes.object.isRequired,
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
            changingNode: false,
            completing2FA: false,
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

    componentWillUnmount() {
        if (this.props.isFingerprintEnabled) {
            FingerprintScanner.release();
        }
    }

    onLoginPress(password) {
        const { t, is2FAEnabled } = this.props;

        if (!password) {
            this.props.generateAlert('error', t('emptyPassword'), t('emptyPasswordExplanation'));
        } else {
            getPasswordFromKeychain()
                .then((passwordFromKeychain) => {
                    const hasCorrectPassword = passwordFromKeychain === password;

                    if (hasCorrectPassword) {
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
                .catch((err) => console.log(err)); // Generate an alert.
        }
    }

    onComplete2FA(token) {
        const { t } = this.props;

        if (token) {
            getTwoFactorAuthKeyFromKeychain()
                .then((key) => {
                    const verified = authenticator.verifyToken(key, token);
                    if (verified) {
                        this.navigateToLoading();
                        this.setState({ completing2FA: false });
                    } else {
                        this.props.generateAlert('error', t('twoFA:wrongCode'), t('twoFA:wrongCodeExplanation'));
                    }
                })
                .catch((err) => console.error(err)); // Generate an alert here.
        } else {
            this.props.generateAlert('error', t('twoFA:emptyCode'), t('emptyCodeExplanation'));
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
                    .then((credentials) => {
                        const password = get(credentials, 'password');
                        this.props.setPassword(password);
                        if (!is2FAEnabled) {
                            this.navigateToLoading();
                        } else {
                            this.setState({ completing2FA: true });
                        }
                    })
                    .catch((err) => console.log(err));
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

    navigateToNodeSelection() {
        this.setState({ changingNode: true });
    }

    navigateToLoading() {
        const { body } = this.props;
        this.props.navigator.push({
            screen: 'loading',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                screenBackgroundColor: body.bg,
                drawUnderStatusBar: true,
                statusBarColor: body.bg,
            },
            animated: false,
            overrideBackPress: true,
        });
    }

    render() {
        const { body, positive, negative, password, isFingerprintEnabled } = this.props;
        const textColor = { color: body.bg };

        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <DynamicStatusBar backgroundColor={body.bg} />
                {!this.state.changingNode &&
                    !this.state.completing2FA && (
                        <EnterPasswordOnLogin
                            backgroundColor={body.bg}
                            negativeColor={negative.color}
                            positiveColor={positive.color}
                            onLoginPress={this.onLoginPress}
                            navigateToNodeSelection={this.navigateToNodeSelection}
                            secondaryBackgroundColor={body.color}
                            textColor={textColor}
                            setLoginPasswordField={(pword) => this.props.setLoginPasswordField(pword)}
                            password={password}
                            activateFingerPrintScanner={() => this.activateFingerPrintScanner()}
                            isFingerprintEnabled={isFingerprintEnabled}
                        />
                    )}
                {!this.state.changingNode &&
                    this.state.completing2FA && (
                        <Enter2FA
                            negativeColor={negative.color}
                            positiveColor={positive.color}
                            onComplete2FA={this.onComplete2FA}
                            onBackPress={this.onBackPress}
                            navigateToNodeSelection={this.navigateToNodeSelection}
                            secondaryBackgroundColor={body.color}
                            textColor={textColor}
                        />
                    )}
                {this.state.changingNode && (
                    <View>
                        <View style={{ flex: 0.8 }} />
                        <View style={{ flex: 4.62 }}>
                            <NodeSelection
                                setNode={(selectedNode) => {
                                    changeIotaNode(selectedNode);
                                    this.props.setFullNode(selectedNode);
                                }}
                                node={this.props.fullNode}
                                nodes={this.props.availablePoWNodes}
                                backPress={() => this.setState({ changingNode: false })}
                                textColor={textColor}
                                secondaryBackgroundColor={body.color}
                            />
                        </View>
                        <View style={{ flex: 0.2 }} />
                    </View>
                )}
                <StatefulDropdownAlert backgroundColor={body.bg} />
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    firstUse: state.account.firstUse,
    selectedAccount: getSelectedAccountViaSeedIndex(state.tempAccount.seedIndex, state.account.accountInfo),
    fullNode: state.settings.fullNode,
    availablePoWNodes: state.settings.availablePoWNodes,
    body: state.settings.theme.body,
    positive: state.settings.theme.positive,
    negative: state.settings.theme.negative,
    is2FAEnabled: state.account.is2FAEnabled,
    isFingerprintEnabled: state.account.isFingerprintEnabled,
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

export default WithBackPressCloseApp()(
    translate(['login', 'global', 'twoFA', 'fingerprintSetup'])(connect(mapStateToProps, mapDispatchToProps)(Login)),
);
