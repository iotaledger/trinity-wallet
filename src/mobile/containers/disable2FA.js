import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { set2FAKey, set2FAStatus } from 'iota-wallet-shared-modules/actions/account';
import { resetWallet } from 'iota-wallet-shared-modules/actions/app';
import { setFirstUse, setOnboardingComplete } from 'iota-wallet-shared-modules/actions/account';
import { Navigation } from 'react-native-navigation';
import { clearTempData, setPassword } from 'iota-wallet-shared-modules/actions/tempAccount';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Image } from 'react-native';
import DynamicStatusBar from '../components/dynamicStatusBar';
import COLORS from '../theme/Colors';
import THEMES from '../theme/themes';
import Fonts from '../theme/Fonts';
import { TextField } from 'react-native-material-textfield';
import OnboardingButtons from '../components/onboardingButtons.js';
import StatefulDropdownAlert from './statefulDropdownAlert';
import { Keyboard } from 'react-native';
import whiteIotaImagePath from 'iota-wallet-shared-modules/images/iota-white.png';
import blackIotaImagePath from 'iota-wallet-shared-modules/images/iota-black.png';

import { width, height } from '../util/dimensions';

class Disable2FA extends Component {
    static propTypes = {
        generateAlert: PropTypes.func.isRequired,
        backgroundColor: PropTypes.object.isRequired,
        negativeColor: PropTypes.object.isRequired,
        set2FAStatus: PropTypes.func.isRequired,
        set2FAKey: PropTypes.func.isRequired,
    };

    constructor() {
        super();

        this.state = {
            password: '',
        };

        this.goBack = this.goBack.bind(this);
        this.disable2FA = this.disable2FA.bind(this);
    }

    disable2FA() {
        this.props.set2FAStatus(false);
        this.props.set2FAKey('');

        this.goBack();
        this.timeout = setTimeout(() => {
            this.props.generateAlert(
                'success',
                '2FA is now disabled',
                'You have succesfully disabled Two Factor Authentication.',
            );
        }, 300);
    }
    goBack() {
        // TODO: A quick workaround to stop UI text fields breaking on android due to react-native-navigation.
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'home',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: THEMES.getHSL(this.props.backgroundColor),
                },
            },
        });
    }

    render() {
        const { t, negativeColor, secondaryBackgroundColor } = this.props;
        const backgroundColor = { backgroundColor: THEMES.getHSL(this.props.backgroundColor) };
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
                borderColor: THEMES.getHSL(negativeColor),
            },
            leftText: {
                color: THEMES.getHSL(negativeColor),
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
                            <TextField
                                style={{ color: secondaryBackgroundColor, fontFamily: 'Lato-Light' }}
                                labelTextStyle={{ fontFamily: 'Lato-Light' }}
                                labelFontSize={width / 31.8}
                                fontSize={width / 20.7}
                                labelPadding={3}
                                baseColor={secondaryBackgroundColor}
                                label="Token"
                                tintColor={THEMES.getHSL(negativeColor)}
                                autoCapitalize={'none'}
                                autoCorrect={false}
                                enablesReturnKeyAutomatically
                                returnKeyType="done"
                                value={this.state.password}
                                onChangeText={password => this.setState({ password })}
                                containerStyle={{
                                    width: width / 1.4,
                                }}
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
                <StatefulDropdownAlert />
            </View>
        );
    }
}

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
        height: width / 7,
        width: width / 7,
    },
});

const mapStateToProps = state => ({
    password: state.tempAccount.password,
    negativeColor: state.settings.theme.negativeColor,
    backgroundColor: state.settings.theme.backgroundColor,
    key2FA: state.account.key2FA,
    secondaryBackgroundColor: state.settings.theme.secondaryBackgroundColor,
});

const mapDispatchToProps = {
    resetWallet,
    setFirstUse,
    setOnboardingComplete,
    clearTempData,
    setPassword,
    generateAlert,
    set2FAKey,
    set2FAStatus,
};

export default translate(['resetWalletRequirePassword', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(Disable2FA),
);
