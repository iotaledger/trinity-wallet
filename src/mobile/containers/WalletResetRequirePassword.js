import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { resetWallet } from 'iota-wallet-shared-modules/actions/app';
import { setFirstUse, setOnboardingComplete } from 'iota-wallet-shared-modules/actions/accounts';
import { Navigation } from 'react-native-navigation';
import { clearWalletData, setPassword } from 'iota-wallet-shared-modules/actions/wallet';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { StyleSheet, View, Keyboard, TouchableWithoutFeedback, BackHandler } from 'react-native';
import OnboardingButtons from '../containers/OnboardingButtons';
import { persistor } from '../store';
import DynamicStatusBar from '../components/DynamicStatusBar';
import Fonts from '../theme/fonts';
import { clearKeychain } from '../utils/keychain';
import { getPasswordHash } from '../utils/crypto';
import CustomTextInput from '../components/CustomTextInput';
import StatefulDropdownAlert from './StatefulDropdownAlert';
import { Icon } from '../theme/icons.js';
import { width, height } from '../utils/dimensions';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topWrapper: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 16,
    },
    midWrapper: {
        flex: 3.7,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: height / 20,
    },
    generalText: {
        fontFamily: Fonts.secondary,
        fontSize: width / 20.7,
        textAlign: 'center',
        paddingBottom: height / 10,
        backgroundColor: 'transparent',
    },
    buttonsContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        flexDirection: 'row',
    },
});

class WalletResetRequirePassword extends Component {
    static propTypes = {
        password: PropTypes.string.isRequired,
        resetWallet: PropTypes.func.isRequired,
        setFirstUse: PropTypes.func.isRequired,
        setOnboardingComplete: PropTypes.func.isRequired,
        clearWalletData: PropTypes.func.isRequired,
        setPassword: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        theme: PropTypes.object.isRequired,
        body: PropTypes.object.isRequired,
        t: PropTypes.func.isRequired,
        navigator: PropTypes.object.isRequired,
    };

    constructor() {
        super();

        this.state = {
            password: '',
        };

        this.goBack = this.goBack.bind(this);
        this.resetWallet = this.resetWallet.bind(this);
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', () => {
            this.goBack();
            return true;
        });
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress');
    }

    goBack() {
        const { body } = this.props;
        this.props.navigator.pop({
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                screenBackgroundColor: body.bg,
                drawUnderStatusBar: true,
                statusBarColor: body.bg,
            },
            animated: false,
        });
    }

    isAuthenticated() {
        const { password } = this.props;
        const pwdHash = getPasswordHash(this.state.password);
        return password === pwdHash;
    }

    redirectToInitialScreen() {
        const { body } = this.props;

        Navigation.startSingleScreenApp({
            screen: {
                screen: 'languageSetup',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: body.bg,
                    statusBarColor: body.bg,
                    drawUnderStatusBar: true,
                },
                overrideBackPress: true,
            },
            appStyle: {
                orientation: 'portrait',
                keepStyleAcrossPush: true,
            },
        });
    }

    resetWallet() {
        const isAuthenticated = this.isAuthenticated();
        const { t } = this.props;

        if (isAuthenticated) {
            persistor
                .purge()
                .then(() => clearKeychain())
                .then(() => {
                    this.redirectToInitialScreen();
                    this.props.setOnboardingComplete(false);
                    this.props.setFirstUse(true);
                    this.props.clearWalletData();
                    this.props.setPassword('');
                    this.props.resetWallet();
                })
                .catch(() => {
                    this.props.generateAlert(
                        'error',
                        t('global:somethingWentWrong'),
                        t('global:somethingWentWrongExplanation'),
                    );
                });
        } else {
            this.props.generateAlert(
                'error',
                t('global:unrecognisedPassword'),
                t('global:unrecognisedPasswordExplanation'),
            );
        }
    }

    render() {
        const { t, body, theme } = this.props;
        const backgroundColor = { backgroundColor: body.bg };

        return (
            <View style={[styles.container, backgroundColor]}>
                <DynamicStatusBar backgroundColor={body.bg} />
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                        <View style={styles.topWrapper}>
                            <Icon name="iota" size={width / 8} color={body.color} />
                        </View>
                        <View style={styles.midWrapper}>
                            <CustomTextInput
                                label={t('global:password')}
                                onChangeText={(password) => this.setState({ password })}
                                value={this.state.password}
                                containerStyle={{ width: width / 1.2 }}
                                autoCapitalize="none"
                                autoCorrect={false}
                                enablesReturnKeyAutomatically
                                returnKeyType="done"
                                theme={theme}
                                secureTextEntry
                            />
                            <View style={{ flex: 0.2 }} />
                        </View>
                        <View style={styles.bottomContainer}>
                            <OnboardingButtons
                                onLeftButtonPress={this.goBack}
                                onRightButtonPress={this.resetWallet}
                                leftText={t('cancel')}
                                rightText={t('reset')}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
                <StatefulDropdownAlert textColor={body.color} backgroundColor={body.bg} />
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
    body: state.settings.theme.body,
    password: state.wallet.password,
});

const mapDispatchToProps = {
    resetWallet,
    setFirstUse,
    setOnboardingComplete,
    clearWalletData,
    setPassword,
    generateAlert,
};

export default translate(['resetWalletRequirePassword', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(WalletResetRequirePassword),
);
