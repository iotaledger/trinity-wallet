import get from 'lodash/get';
import { translate } from 'react-i18next';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import authenticator from 'authenticator';
import PropTypes from 'prop-types';
import KeepAwake from 'react-native-keep-awake';
import { StyleSheet, View } from 'react-native';
import { setFullNode } from 'iota-wallet-shared-modules/actions/settings';
import { getVersion, getBuildNumber } from 'react-native-device-info';
import { setPassword, setReady, setSetting } from 'iota-wallet-shared-modules/actions/wallet';
import { setUserActivity, setLoginPasswordField } from 'iota-wallet-shared-modules/actions/ui';
import { changeHomeScreenRoute } from 'iota-wallet-shared-modules/actions/home';
import { changeIotaNode } from 'iota-wallet-shared-modules/libs/iota';
import { getSelectedAccountName } from 'iota-wallet-shared-modules/selectors/accounts';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import WithBackPressCloseApp from '../components/BackPressCloseApp';
import DynamicStatusBar from '../components/DynamicStatusBar';
import NodeSelection from './NodeSelection';
import EnterPasswordOnLogin from '../components/EnterPasswordOnLogin';
import Enter2FA from '../components/Enter2FA';
import StatefulDropdownAlert from './StatefulDropdownAlert';
import { getAllSeedsFromKeychain, getTwoFactorAuthKeyFromKeychain, logTwoFa } from '../utils/keychain';
import { getPasswordHash } from '../utils/crypto';
import { migrate } from '../../shared/actions/app';
import { persistor, persistConfig } from '../store';
import { width, height } from '../utils/dimensions';

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
        theme: PropTypes.object.isRequired,
        is2FAEnabled: PropTypes.bool.isRequired,
        setUserActivity: PropTypes.func.isRequired,
        migrate: PropTypes.func.isRequired,
        setLoginPasswordField: PropTypes.func.isRequired,
        password: PropTypes.string.isRequired,
        pwdHash: PropTypes.string.isRequired,
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

    async onLoginPress(password) {
        const { t, is2FAEnabled } = this.props;
        if (!password) {
            this.props.generateAlert('error', t('emptyPassword'), t('emptyPasswordExplanation'));
        } else {
            const pwdHash = getPasswordHash(password);
            getAllSeedsFromKeychain(pwdHash).then((seedInfo) => {
                if (seedInfo !== null) {
                    this.props.setPassword(pwdHash);
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
            });
        }
    }

    async onComplete2FA(token) {
        const { t, pwdHash } = this.props;
        if (token) {
            console.log(pwdHash);
            logTwoFa(pwdHash);
            const key = await getTwoFactorAuthKeyFromKeychain(pwdHash);
            //console.log(key)
            if (key === null) {
                this.props.generateAlert(
                    'error',
                    t('global:somethingWentWrong'),
                    t('global:somethingWentWrongTryAgain'),
                );
            }
            const verified = authenticator.verifyToken(key, token);
            if (verified) {
                this.navigateToLoading();
                this.setState({ completing2FA: false });
            } else {
                this.props.generateAlert('error', t('twoFA:wrongCode'), t('twoFA:wrongCodeExplanation'));
            }
        } else {
            this.props.generateAlert('error', t('twoFA:emptyCode'), t('emptyCodeExplanation'));
        }
    }

    onBackPress() {
        this.setState({ completing2FA: false });
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
        const { body, theme, password, pwdHash } = this.props;
        const textColor = { color: body.bg };

        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <DynamicStatusBar backgroundColor={body.bg} />
                {!this.state.changingNode &&
                    !this.state.completing2FA && (
                        <EnterPasswordOnLogin
                            theme={theme}
                            onLoginPress={this.onLoginPress}
                            navigateToNodeSelection={this.navigateToNodeSelection}
                            textColor={textColor}
                            setLoginPasswordField={(pword) => this.props.setLoginPasswordField(pword)}
                            password={password}
                        />
                    )}
                {!this.state.changingNode &&
                    this.state.completing2FA && (
                        <Enter2FA
                            onComplete2FA={this.onComplete2FA}
                            onBackPress={this.onBackPress}
                            navigateToNodeSelection={this.navigateToNodeSelection}
                            theme={theme}
                            pwdHash={pwdHash}
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
                                body={body}
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
    selectedAccount: getSelectedAccountName(state),
    fullNode: state.settings.fullNode,
    availablePoWNodes: state.settings.availablePoWNodes,
    theme: state.settings.theme,
    body: state.settings.theme.body,
    is2FAEnabled: state.account.is2FAEnabled,
    versions: state.app.versions,
    accountInfo: state.account.accountInfo,
    password: state.ui.loginPasswordFieldText,
    pwdHash: state.tempAccount.password,
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
    translate(['login', 'global', 'twoFA'])(connect(mapStateToProps, mapDispatchToProps)(Login)),
);
