import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import authenticator from 'authenticator';
import { resetWallet } from 'iota-wallet-shared-modules/actions/app';
import { setFirstUse, setOnboardingComplete, set2FAStatus } from 'iota-wallet-shared-modules/actions/account';
import { Navigation } from 'react-native-navigation';
import { clearTempData } from 'iota-wallet-shared-modules/actions/tempAccount';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { getTwoFactorAuthKeyFromKeychain } from '../util/keychain';
import DynamicStatusBar from '../components/dynamicStatusBar';
import COLORS from '../theme/Colors';
import Fonts from '../theme/Fonts';
import CustomTextInput from '../components/customTextInput';
import OnboardingButtons from '../components/onboardingButtons';
import StatefulDropdownAlert from './statefulDropdownAlert';
import { width, height } from '../util/dimensions';
import { Icon } from '../theme/icons.js';

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
        paddingBottom: height / 20,
    },
    generalText: {
        fontFamily: Fonts.secondary,
        fontSize: width / 20.7,
        textAlign: 'center',
        paddingBottom: height / 10,
        backgroundColor: 'transparent',
    },
    questionText: {
        fontFamily: Fonts.secondary,
        fontSize: width / 20.25,
        textAlign: 'center',
        paddingLeft: width / 7,
        paddingRight: width / 7,
        paddingTop: height / 25,
        backgroundColor: 'transparent',
    },
});

class Disable2FA extends Component {
    static propTypes = {
        generateAlert: PropTypes.func.isRequired,
        body: PropTypes.object.isRequired,
        negative: PropTypes.object.isRequired,
        t: PropTypes.func.isRequired,
        set2FAStatus: PropTypes.func.isRequired,
    };

    constructor() {
        super();

        this.state = {
            token: '',
        };

        this.goBack = this.goBack.bind(this);
        this.disable2FA = this.disable2FA.bind(this);
    }

    /**
     * Attempts to disable 2FA, fails if the token is not correct
     */
    disable2FA() {
        return getTwoFactorAuthKeyFromKeychain()
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
        const { body } = this.props;
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'home',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: body.bg,
                    drawUnderStatusBar: true,
                    statusBarColor: body.bg,
                },
            },
            appStyle: {
                orientation: 'portrait',
                keepStyleAcrossPush: true,
            },
        });
    }

    render() {
        const { t, body, negative } = this.props;
        const backgroundColor = { backgroundColor: body.bg };
        const textColor = { color: body.color };

        const onboardingButtonsOverride = {
            rightButton: {
                borderColor: COLORS.red,
            },
            rightText: {
                color: COLORS.red,
                fontFamily: Fonts.secondary,
            },
            leftButton: {
                borderColor: negative.color,
            },
            leftText: {
                color: negative.color,
            },
        };

        return (
            <View style={[styles.container, backgroundColor]}>
                <DynamicStatusBar textColor={body.color} />
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                        <View style={styles.topWrapper}>
                            <Icon name="iota" size={width / 8} color={body.color} />{' '}
                        </View>
                        <View style={styles.midWrapper}>
                            <Text style={[styles.generalText, textColor]}>Enter your token to disable 2FA</Text>
                            <CustomTextInput
                                label="Token"
                                onChangeText={(token) => this.setState({ token })}
                                containerStyle={{ width: width / 1.36 }}
                                autoCapitalize="none"
                                autoCorrect={false}
                                enablesReturnKeyAutomatically
                                returnKeyType="done"
                                secondaryBackgroundColor={body.color}
                                negativeColor={negative.color}
                                value={this.state.token}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={styles.bottomContainer}>
                            <OnboardingButtons
                                style={onboardingButtonsOverride}
                                onLeftButtonPress={this.goBack}
                                onRightButtonPress={this.disable2FA}
                                leftText={t('cancel')}
                                rightText="DONE"
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
    negative: state.settings.theme.negative,
    body: state.settings.theme.body,
});

const mapDispatchToProps = {
    resetWallet,
    setFirstUse,
    setOnboardingComplete,
    clearTempData,
    generateAlert,
    set2FAStatus,
};

export default translate(['resetWalletRequirePassword', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(Disable2FA),
);
