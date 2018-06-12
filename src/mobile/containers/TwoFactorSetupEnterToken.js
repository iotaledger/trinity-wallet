import React, { Component } from 'react';
import PropTypes from 'prop-types';
import authenticator from 'authenticator';
import { set2FAStatus } from 'iota-wallet-shared-modules/actions/settings';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard, BackHandler } from 'react-native';
import { translate } from 'react-i18next';
import DynamicStatusBar from '../components/DynamicStatusBar';
import CustomTextInput from '../components/CustomTextInput';
import Fonts from '../theme/fonts';
import { getTwoFactorAuthKeyFromKeychain } from '../utils/keychain';
import OnboardingButtons from '../containers/OnboardingButtons';
import StatefulDropdownAlert from './StatefulDropdownAlert';
import { width, height } from '../utils/dimensions';
import { Icon } from '../theme/icons.js';
import GENERAL from '../theme/general';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topWrapper: {
        flex: 0.3,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 16,
        width,
    },
    midWrapper: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    bottomWrapper: {
        flex: 0.3,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    subHeaderText: {
        fontFamily: Fonts.secondary,
        fontSize: GENERAL.fontSize4,
        textAlign: 'center',
        backgroundColor: 'transparent',
        marginBottom: height / 8,
    },
});

/** Two factor authentication token verification component */
class TwoFactorSetupEnterToken extends Component {
    static propTypes = {
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Generate a notification alert
         * @param {string} type - notification type - success, error
         * @param {string} title - notification title
         * @param {string} text - notification explanation
         */
        generateAlert: PropTypes.func.isRequired,
        /** Sets two factor security status
         * @param {boolean} - status
         */
        set2FAStatus: PropTypes.func.isRequired,
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Wallet's password hash */
        password: PropTypes.string.isRequired,
    };

    constructor() {
        super();

        this.goBack = this.goBack.bind(this);
        this.check2FA = this.check2FA.bind(this);

        this.state = {
            code: '',
        };
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

    navigateToHome() {
        const { theme: { body, bar } } = this.props;
        this.props.navigator.push({
            screen: 'home',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                topBarElevationShadowEnabled: false,
                screenBackgroundColor: body.bg,
                drawUnderStatusBar: true,
                statusBarColor: bar.bg,
            },
            animated: false,
        });
    }

    check2FA() {
        const { t, password } = this.props;
        getTwoFactorAuthKeyFromKeychain(password).then((key) => {
            if (key === null) {
                this.props.generateAlert(
                    'error',
                    t('global:somethingWentWrong'),
                    t('global:somethingWentWrongTryAgain'),
                );
            }
            const verified = authenticator.verifyToken(key, this.state.code);

            if (verified) {
                this.props.set2FAStatus(true);
                this.navigateToHome();

                this.timeout = setTimeout(() => {
                    this.props.generateAlert('success', t('twoFAEnabled'), t('twoFAEnabledExplanation'));
                }, 300);
            } else {
                this.props.generateAlert('error', t('wrongCode'), t('wrongCodeExplanation'));
            }
        });
    }

    render() {
        const { theme, t } = this.props;
        const backgroundColor = { backgroundColor: theme.body.bg };
        const textColor = { color: theme.body.color };

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={[styles.container, backgroundColor]}>
                    <DynamicStatusBar backgroundColor={theme.body.bg} />
                    <View style={styles.topWrapper}>
                        <Icon name="iota" size={width / 8} color={theme.body.color} />
                    </View>
                    <View style={styles.midWrapper}>
                        <View style={{ flex: 0.25 }} />
                        <Text style={[styles.subHeaderText, textColor]}>{t('enterCode')}</Text>
                        <CustomTextInput
                            label={t('code')}
                            onChangeText={(code) => this.setState({ code })}
                            containerStyle={{ width: width / 1.15 }}
                            autoCapitalize="none"
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="done"
                            onSubmitEditing={this.check2FA}
                            theme={theme}
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={styles.bottomWrapper}>
                        <OnboardingButtons
                            onLeftButtonPress={this.goBack}
                            onRightButtonPress={this.check2FA}
                            leftButtonText={t('global:backLowercase')}
                            rightButtonText={t('global:doneLowercase')}
                        />
                    </View>
                    <StatefulDropdownAlert textColor={theme.body.color} backgroundColor={theme.body.bg} />
                </View>
            </TouchableWithoutFeedback>
        );
    }
}
const mapDispatchToProps = {
    set2FAStatus,
    generateAlert,
};

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
    password: state.wallet.password,
});

export default translate(['twoFA', 'global'])(connect(mapStateToProps, mapDispatchToProps)(TwoFactorSetupEnterToken));
