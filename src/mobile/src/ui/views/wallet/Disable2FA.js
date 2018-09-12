import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import authenticator from 'authenticator';
import { resetWallet, set2FAStatus } from 'shared-modules/actions/settings';
import { setFirstUse } from 'shared-modules/actions/accounts';
import { generateAlert } from 'shared-modules/actions/alerts';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { getTwoFactorAuthKeyFromKeychain } from 'libs/keychain';
import DynamicStatusBar from 'ui/components/DynamicStatusBar';
import Fonts from 'ui/theme/fonts';
import CustomTextInput from 'ui/components/CustomTextInput';
import OnboardingButtons from 'ui/components/OnboardingButtons';
import StatefulDropdownAlert from 'ui/components/StatefulDropdownAlert';
import { width, height } from 'libs/dimensions';
import { Icon } from 'ui/theme/icons';
import GENERAL from 'ui/theme/general';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

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
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        set2FAStatus: PropTypes.func.isRequired,
        /** @ignore */
        password: PropTypes.object.isRequired,
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
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

    /**
     * Navigates to home screen
     *
     * @method goBack
     */
    goBack() {
        const { theme: { bar, body } } = this.props;
        this.props.navigator.resetTo({
            screen: 'home',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                topBarElevationShadowEnabled: false,
                screenBackgroundColor: body.bg,
                drawUnderStatusBar: true,
                statusBarColor: bar.alt,
            },
            animated: false,
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
