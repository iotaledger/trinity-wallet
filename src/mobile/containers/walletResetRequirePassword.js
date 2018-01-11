import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import keychain from '../util/keychain';
import { resetWallet } from 'iota-wallet-shared-modules/actions/app';
import { setFirstUse, setOnboardingComplete } from 'iota-wallet-shared-modules/actions/account';
import { Navigation } from 'react-native-navigation';
import { clearTempData, setPassword } from 'iota-wallet-shared-modules/actions/tempAccount';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { persistor } from '../store';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Image, BackHandler } from 'react-native';
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

class WalletResetRequirePassword extends Component {
    static propTypes = {
        password: PropTypes.string.isRequired,
        navigator: PropTypes.object.isRequired,
        resetWallet: PropTypes.func.isRequired,
        setFirstUse: PropTypes.func.isRequired,
        setOnboardingComplete: PropTypes.func.isRequired,
        clearTempData: PropTypes.func.isRequired,
        setPassword: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        backgroundColor: PropTypes.object.isRequired,
        negativeColor: PropTypes.object.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
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
            appStyle: {
                orientation: 'portrait',
            },
        });
    }

    isAuthenticated() {
        return this.props.password === this.state.password;
    }

    redirectToInitialScreen() {
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'welcome',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: THEMES.getHSL(this.props.backgroundColor),
                },
                overrideBackPress: true,
            },
            appStyle: {
                orientation: 'portrait',
            },
        });
    }

    resetWallet() {
        const isAuthenticated = this.isAuthenticated();
        const { t } = this.props;

        if (isAuthenticated) {
            persistor
                .purge()
                .then(() => keychain.clear())
                .then(() => {
                    this.redirectToInitialScreen();
                    this.props.setOnboardingComplete(false);
                    this.props.setFirstUse(true);
                    this.props.clearTempData();
                    this.props.setPassword('');
                    this.props.resetWallet();
                })
                .catch((error) => {
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
        const { t, negativeColor, secondaryBackgroundColor } = this.props;
        const textColor = { color: secondaryBackgroundColor };

        const backgroundColor = { backgroundColor: THEMES.getHSL(this.props.backgroundColor) };
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
                            <Text style={[styles.generalText, textColor]}>{t('enterPassword')}</Text>
                            <TextField
                                style={{ color: secondaryBackgroundColor, fontFamily: 'Lato-Light' }}
                                labelTextStyle={{ fontFamily: 'Lato-Light' }}
                                labelFontSize={width / 31.8}
                                fontSize={width / 20.7}
                                labelPadding={3}
                                baseColor={secondaryBackgroundColor}
                                label={t('global:password')}
                                tintColor={THEMES.getHSL(negativeColor)}
                                autoCapitalize={'none'}
                                autoCorrect={false}
                                enablesReturnKeyAutomatically
                                returnKeyType="done"
                                value={this.state.password}
                                onChangeText={(password) => this.setState({ password })}
                                containerStyle={{
                                    width: width / 1.4,
                                }}
                                secureTextEntry
                            />
                        </View>
                        <View style={styles.bottomContainer}>
                            <OnboardingButtons
                                style={onboardingButtonsOverride}
                                onLeftButtonPress={this.goBack}
                                onRightButtonPress={this.resetWallet}
                                leftText={t('cancel')}
                                rightText={t('reset')}
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
    iotaLogo: {
        height: width / 7,
        width: width / 7,
    },
    buttonsContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        flexDirection: 'row',
    },
});

const mapStateToProps = (state) => ({
    password: state.tempAccount.password,
    negativeColor: state.settings.theme.negativeColor,
    backgroundColor: state.settings.theme.backgroundColor,
    secondaryBackgroundColor: state.settings.theme.secondaryBackgroundColor,
});

const mapDispatchToProps = {
    resetWallet,
    setFirstUse,
    setOnboardingComplete,
    clearTempData,
    setPassword,
    generateAlert,
};

export default translate(['resetWalletRequirePassword', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(WalletResetRequirePassword),
);
