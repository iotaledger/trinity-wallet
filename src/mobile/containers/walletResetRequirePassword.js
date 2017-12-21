import toUpper from 'lodash/toUpper';
import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import keychain from '../util/keychain';
import { resetWallet } from 'iota-wallet-shared-modules/actions/app';
import { setFirstUse, setOnboardingComplete } from 'iota-wallet-shared-modules/actions/account';
import { Navigation } from 'react-native-navigation';
import { clearTempData, setPassword } from 'iota-wallet-shared-modules/actions/tempAccount';
import PropTypes from 'prop-types';
import { persistor } from '../store';
import {
    StyleSheet,
    View,
    Text,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Image,
    ScrollView,
    StatusBar,
} from 'react-native';
import COLORS from '../theme/Colors';
import Fonts from '../theme/Fonts';
import { TextField } from 'react-native-material-textfield';
import OnboardingButtons from '../components/onboardingButtons.js';
import { Keyboard } from 'react-native';
import DropdownHolder from '../components/dropdownHolder';
import DropdownAlert from 'react-native-dropdownalert';
import iotaGlowImagePath from 'iota-wallet-shared-modules/images/iota-glow.png';

import { width, height } from '../util/dimensions';

class WalletResetRequirePassword extends Component {
    constructor() {
        super();
        this.state = {
            password: '',
        };

        this.goBack = this.goBack.bind(this);
        this.resetWallet = this.resetWallet.bind(this);
    }

    goBack() {
        // FIXME: A quick workaround to stop UI text fields breaking on android due to react-native-navigation.
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'home',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: COLORS.backgroundDarkGreen,
                },
                overrideBackPress: true,
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
                    screenBackgroundImageName: 'bg-blue.png',
                    screenBackgroundColor: COLORS.backgroundDarkGreen,
                },
                overrideBackPress: true,
            },
        });
    }

    resetWallet() {
        const isAuthenticated = this.isAuthenticated();
        const { password, resetWallet, t } = this.props;
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
                .catch(error => {
                    this.dropdown.alertWithType(
                        'error',
                        t('global:somethingWentWrong'),
                        t('global:somethingWentWrongExplanation'),
                    );
                });
        } else {
            this.dropdown.alertWithType(
                'error',
                t('global:unrecognisedPassword'),
                t('global:unrecognisedPasswordExplanation'),
            );
        }
    }

    render() {
        const { t } = this.props;

        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                        <View style={styles.topWrapper}>
                            <Image source={iotaGlowImagePath} style={styles.iotaLogo} />
                        </View>
                        <View style={styles.midWrapper}>
                            <Text style={styles.generalText}>{t('enterPassword')}</Text>
                            <TextField
                                style={{ color: 'white', fontFamily: 'Lato-Light' }}
                                labelTextStyle={{ fontFamily: 'Lato-Light' }}
                                labelFontSize={width / 31.8}
                                fontSize={width / 20.7}
                                labelPadding={3}
                                baseColor="white"
                                label={t('global:password')}
                                tintColor="#F7D002"
                                autoCapitalize={'none'}
                                autoCorrect={false}
                                enablesReturnKeyAutomatically
                                returnKeyType="done"
                                value={this.state.password}
                                onChangeText={password => this.setState({ password })}
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
                <DropdownAlert
                    ref={ref => (this.dropdown = ref)}
                    successColor={COLORS.dropdown.success}
                    errorColor={COLORS.dropdown.error}
                    titleStyle={styles.dropdownTitle}
                    defaultTextContainer={styles.dropdownTextContainer}
                    messageStyle={styles.dropdownMessage}
                    imageStyle={styles.dropdownImage}
                    inactiveStatusBarStyle="light-content"
                />
            </View>
        );
    }
}

const onboardingButtonsOverride = StyleSheet.create({
    rightButton: {
        borderColor: COLORS.red,
    },
    rightText: {
        color: COLORS.red,
        fontFamily: Fonts.secondary,
    },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundGreen,
    },
    topWrapper: {
        flex: 1.3,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
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
        color: 'white',
        fontFamily: Fonts.secondary,
        fontSize: width / 20.7,
        textAlign: 'center',
        paddingBottom: height / 10,
        backgroundColor: 'transparent',
    },
    questionText: {
        color: COLORS.white,
        fontFamily: Fonts.secondary,
        fontSize: width / 20.25,
        textAlign: 'center',
        paddingLeft: width / 7,
        paddingRight: width / 7,
        paddingTop: height / 25,
        backgroundColor: 'transparent',
    },
    newSeedButton: {
        borderColor: COLORS.orangeDark,
        borderWidth: 1.2,
        borderRadius: 10,
        width: width / 1.65,
        height: height / 17,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginRight: width / 10,
    },
    newSeedText: {
        color: COLORS.orangeDark,
        fontFamily: Fonts.tertiary,
        fontSize: width / 25.3,
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
    textFieldContainer: {
        width: width / 1.65,
    },
    textField: {
        color: COLORS.white,
        fontFamily: Fonts.tertiary,
    },
    textFieldLabel: {
        fontFamily: Fonts.tertiary,
    },
    dropdownTitle: {
        fontSize: width / 25.9,
        textAlign: 'left',
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
    },
    dropdownTextContainer: {
        flex: 1,
        paddingLeft: width / 20,
        paddingRight: width / 15,
        paddingVertical: height / 30,
    },
    dropdownMessage: {
        fontSize: width / 29.6,
        textAlign: 'left',
        fontWeight: 'normal',
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        paddingTop: height / 60,
    },
    dropdownImage: {
        marginLeft: width / 25,
        width: width / 12,
        height: width / 12,
        alignSelf: 'center',
    },
});

const mapStateToProps = state => ({
    password: state.tempAccount.password,
});

const mapDispatchToProps = dispatch => ({
    resetWallet: () => dispatch(resetWallet()),
    setFirstUse: boolean => dispatch(setFirstUse(boolean)),
    setOnboardingComplete: boolean => dispatch(setOnboardingComplete(boolean)),
    clearTempData: () => dispatch(clearTempData()),
    setPassword: password => dispatch(setPassword(password)),
});

WalletResetRequirePassword.propTypes = {
    password: PropTypes.string.isRequired,
    navigator: PropTypes.object.isRequired,
    resetWallet: PropTypes.func.isRequired,
};

export default translate(['resetWalletRequirePassword', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(WalletResetRequirePassword),
);
