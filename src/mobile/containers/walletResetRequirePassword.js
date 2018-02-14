import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { resetWallet } from 'iota-wallet-shared-modules/actions/app';
import { setFirstUse, setOnboardingComplete } from 'iota-wallet-shared-modules/actions/account';
import { Navigation } from 'react-native-navigation';
import { clearTempData, setPassword } from 'iota-wallet-shared-modules/actions/tempAccount';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import whiteIotaImagePath from 'iota-wallet-shared-modules/images/iota-white.png';
import blackIotaImagePath from 'iota-wallet-shared-modules/images/iota-black.png';
import { StyleSheet, View, Keyboard, TouchableWithoutFeedback, Image, BackHandler } from 'react-native';
import OnboardingButtons from '../components/onboardingButtons';
import { persistor } from '../store';
import DynamicStatusBar from '../components/dynamicStatusBar';
import COLORS from '../theme/Colors';
import Fonts from '../theme/Fonts';
import keychain from '../util/keychain';
import CustomTextInput from '../components/customTextInput';
import StatefulDropdownAlert from './statefulDropdownAlert';

import { width, height } from '../util/dimensions';

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
        paddingTop: height / 22,
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
    iotaLogo: {
        height: width / 5,
        width: width / 5,
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
        clearTempData: PropTypes.func.isRequired,
        setPassword: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        backgroundColor: PropTypes.string.isRequired,
        negativeColor: PropTypes.string.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        t: PropTypes.func.isRequired,
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
                    screenBackgroundColor: this.props.backgroundColor,
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
                screen: 'languageSetup',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: this.props.backgroundColor,
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
        const { t, negativeColor, secondaryBackgroundColor } = this.props;
        const backgroundColor = { backgroundColor: this.props.backgroundColor };
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
                            <CustomTextInput
                                label={t('global:password')}
                                onChangeText={(password) => this.setState({ password })}
                                value={this.state.password}
                                containerStyle={{ width: width / 1.2 }}
                                autoCapitalize={'none'}
                                autoCorrect={false}
                                enablesReturnKeyAutomatically
                                returnKeyType="done"
                                onSubmitEditing={this.handleLogin}
                                secondaryBackgroundColor={secondaryBackgroundColor}
                                negativeColor={negativeColor}
                                secureTextEntry
                            />
                            <View style={{ flex: 0.2 }} />
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
