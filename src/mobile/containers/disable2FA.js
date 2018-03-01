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
import whiteIotaImagePath from 'iota-wallet-shared-modules/images/iota-white.png';
import blackIotaImagePath from 'iota-wallet-shared-modules/images/iota-black.png';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Image, Keyboard } from 'react-native';
import { getTwoFactorAuthKeyFromKeychain } from '../util/keychain';
import DynamicStatusBar from '../components/dynamicStatusBar';
import COLORS from '../theme/Colors';
import Fonts from '../theme/Fonts';
import CustomTextInput from '../components/customTextInput';
import OnboardingButtons from '../components/onboardingButtons';
import StatefulDropdownAlert from './statefulDropdownAlert';
import { width, height } from '../util/dimensions';

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
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
});

class Disable2FA extends Component {
    static propTypes = {
        generateAlert: PropTypes.func.isRequired,
        backgroundColor: PropTypes.string.isRequired,
        negativeColor: PropTypes.string.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
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
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'home',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: this.props.backgroundColor,
                    drawUnderStatusBar: true,
                    statusBarColor: this.props.backgroundColor,
                },
            },
            appStyle: {
                orientation: 'portrait',
                keepStyleAcrossPush: true,
            },
        });
    }

    render() {
        const { t, negativeColor, secondaryBackgroundColor } = this.props;
        const backgroundColor = { backgroundColor: this.props.backgroundColor };
        const textColor = { color: secondaryBackgroundColor };
        const iotaLogoImagePath = secondaryBackgroundColor === 'white' ? whiteIotaImagePath : blackIotaImagePath;

        const onboardingButtonsOverride = {
            rightButton: {
                borderColor: COLORS.red,
            },
            rightText: {
                color: COLORS.red,
                fontFamily: Fonts.secondary,
            },
            leftButton: {
                borderColor: negativeColor,
            },
            leftText: {
                color: negativeColor,
            },
        };

        return (
            <View style={[styles.container, backgroundColor]}>
                <DynamicStatusBar textColor={secondaryBackgroundColor} />
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                        <View style={styles.topWrapper}>
                            <Image source={iotaLogoImagePath} style={styles.iotaLogo} />
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
                                secondaryBackgroundColor={secondaryBackgroundColor}
                                negativeColor={negativeColor}
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
                <StatefulDropdownAlert
                    textColor={secondaryBackgroundColor}
                    backgroundColor={this.props.backgroundColor}
                />
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    negativeColor: state.settings.theme.negativeColor,
    backgroundColor: state.settings.theme.backgroundColor,
    secondaryBackgroundColor: state.settings.theme.secondaryBackgroundColor,
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
