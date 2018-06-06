import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { resetWallet } from 'iota-wallet-shared-modules/actions/settings';
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
import GENERAL from '../theme/general';

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
    },
    generalText: {
        fontFamily: Fonts.secondary,
        fontSize: GENERAL.fontSize4,
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

/**
 * Wallet Reset Require Password screen component
 */
class WalletResetRequirePassword extends Component {
    static propTypes = {
        /** Hash for wallet password */
        password: PropTypes.string.isRequired,
        /** Resets wallet to default state */
        resetWallet: PropTypes.func.isRequired,
        /** Sets wallet's first use
         * @param {boolean} - true
         */
        setFirstUse: PropTypes.func.isRequired,
        /** Sets wallet's onboarding status
         * @param {boolean} - status
         */
        setOnboardingComplete: PropTypes.func.isRequired,
        /** Clears wallet reducer data */
        clearWalletData: PropTypes.func.isRequired,
        /** Set new password hash
         * @param {string} passwordHash
         */
        setPassword: PropTypes.func.isRequired,
        /** Generate a notification alert
         * @param {String} type - notification type - success, error
         * @param {String} title - notification title
         * @param {String} text - notification explanation
         */
        generateAlert: PropTypes.func.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Navigation object */
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
        const { theme: { body } } = this.props;
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
        const { theme: { body } } = this.props;

        Navigation.startSingleScreenApp({
            screen: {
                screen: 'languageSetup',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    topBarElevationShadowEnabled: false,
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
            this.redirectToInitialScreen();
            persistor
                .purge()
                .then(() => clearKeychain())
                .then(() => {
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
        const { t, theme } = this.props;
        const backgroundColor = { backgroundColor: theme.body.bg };

        return (
            <View style={[styles.container, backgroundColor]}>
                <DynamicStatusBar backgroundColor={theme.body.bg} />
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                        <View style={styles.topWrapper}>
                            <Icon name="iota" size={width / 8} color={theme.body.color} />
                        </View>
                        <View style={styles.midWrapper}>
                            <CustomTextInput
                                label={t('global:password')}
                                onChangeText={(password) => this.setState({ password })}
                                value={this.state.password}
                                containerStyle={{ width: width / 1.15 }}
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
                                leftButtonText={t('cancel')}
                                rightButtonText={t('reset')}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
                <StatefulDropdownAlert textColor={theme.body.color} backgroundColor={theme.body.bg} />
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
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
