import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import authenticator from 'authenticator';
import { resetWallet, set2FAStatus } from 'iota-wallet-shared-modules/actions/settings';
import { setFirstUse } from 'iota-wallet-shared-modules/actions/accounts';
import { Navigation } from 'react-native-navigation';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { getTwoFactorAuthKeyFromKeychain } from '../utils/keychain';
import DynamicStatusBar from '../components/DynamicStatusBar';
import Fonts from '../theme/fonts';
import CustomTextInput from '../components/CustomTextInput';
import OnboardingButtons from '../containers/OnboardingButtons';
import StatefulDropdownAlert from './StatefulDropdownAlert';
import { width, height } from '../utils/dimensions';
import { Icon } from '../theme/icons.js';
import GENERAL from '../theme/general';
import { leaveNavigationBreadcrumb } from '../utils/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topWrapper: {
        flex: 1.3,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 16,
    },
    midWrapper: {
        flex: 1.6,
        alignItems: 'center',
    },
    bottomContainer: {
        flex: 2,
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
});

/** Disable Two Factor Authentication component */
class Disable2FA extends Component {
    static propTypes = {
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
        /** Sets two factor security status
         * @param {boolean} - status
         */
        set2FAStatus: PropTypes.func.isRequired,
        /** Hash for wallet's password */
        password: PropTypes.string.isRequired,
    };

    constructor() {
        super();

        this.state = {
            token: '',
        };

        this.goBack = this.goBack.bind(this);
        this.disable2FA = this.disable2FA.bind(this);
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('Disable2FA');
    }

    /**
     * Attempts to disable 2FA, fails if the token is not correct
     */
    disable2FA() {
        return getTwoFactorAuthKeyFromKeychain(this.props.password)
            .then((key) => {
                const verified = authenticator.verifyToken(key, this.state.token);
                if (verified) {
                    this.props.set2FAStatus(false);

                    this.goBack();
                    this.timeout = setTimeout(() => {
                        this.props.generateAlert(
                            'success',
                            '2FA is now disabled',
                            'You have successfully disabled Two Factor Authentication.',
                        );
                    }, 300);
                } else {
                    this.props.generateAlert('error', 'Wrong code', 'The code you entered is not correct.');
                }
            })
            .catch((err) => console.error(err)); // eslint-disable-line no-console
    }

    goBack() {
        const { theme } = this.props;
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'home',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    topBarElevationShadowEnabled: false,
                    screenBackgroundColor: theme.body.bg,
                    drawUnderStatusBar: true,
                    statusBarColor: theme.body.bg,
                },
            },
            appStyle: {
                orientation: 'portrait',
                keepStyleAcrossPush: true,
            },
        });
    }

    render() {
        const { t, theme } = this.props;
        const backgroundColor = { backgroundColor: theme.body.bg };
        const textColor = { color: theme.body.color };

        return (
            <View style={[styles.container, backgroundColor]}>
                <DynamicStatusBar backgroundColor={theme.body.bg} />
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                        <View style={styles.topWrapper}>
                            <Icon name="iota" size={width / 8} color={theme.body.color} />
                        </View>
                        <View style={styles.midWrapper}>
                            <Text style={[styles.generalText, textColor]}>Enter your token to disable 2FA</Text>
                            <CustomTextInput
                                label="Token"
                                onChangeText={(token) => this.setState({ token })}
                                containerStyle={{ width: width / 1.15 }}
                                autoCapitalize="none"
                                autoCorrect={false}
                                enablesReturnKeyAutomatically
                                returnKeyType="done"
                                value={this.state.token}
                                keyboardType="numeric"
                                theme={theme}
                            />
                        </View>
                        <View style={styles.bottomContainer}>
                            <OnboardingButtons
                                onLeftButtonPress={this.goBack}
                                onRightButtonPress={this.disable2FA}
                                leftButtonText={t('global:cancel')}
                                rightButtonText={t('done')}
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
    generateAlert,
    set2FAStatus,
};

export default translate(['resetWalletRequirePassword', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(Disable2FA),
);
