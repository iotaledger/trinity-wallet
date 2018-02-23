import React, { Component } from 'react';
import PropTypes from 'prop-types';
import authenticator from 'authenticator';
import { set2FAStatus } from 'iota-wallet-shared-modules/actions/account';
import whiteIotaImagePath from 'iota-wallet-shared-modules/images/iota-white.png';
import blackIotaImagePath from 'iota-wallet-shared-modules/images/iota-black.png';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, Image, TouchableWithoutFeedback, Keyboard, BackHandler } from 'react-native';
import { translate } from 'react-i18next';
import { Navigation } from 'react-native-navigation';
import DynamicStatusBar from '../components/dynamicStatusBar';
import CustomTextInput from '../components/customTextInput';
import Fonts from '../theme/Fonts';
import { getTwoFactorAuthKeyFromKeychain } from '../util/keychain';
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
        flex: 0.3,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
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
        paddingBottom: height / 20,
    },
    subHeaderText: {
        fontFamily: Fonts.secondary,
        fontSize: width / 20.7,
        textAlign: 'center',
        backgroundColor: 'transparent',
        marginBottom: height / 8,
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
});

class TwoFactorSetupEnterToken extends Component {
    static propTypes = {
        backgroundColor: PropTypes.string.isRequired,
        negativeColor: PropTypes.string.isRequired,
        generateAlert: PropTypes.func.isRequired,
        set2FAStatus: PropTypes.func.isRequired,
        navigator: PropTypes.object.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        t: PropTypes.func.isRequired,
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
        this.props.navigator.pop({
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                screenBackgroundColor: this.props.backgroundColor,
                drawUnderStatusBar: true,
                statusBarColor: this.props.backgroundColor,
            },
            animated: false,
        });
    }

    navigateToHome() {
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
                keepStyleAcrossPush: false,
            },
        });
    }

    check2FA() {
        const { t } = this.props;
        getTwoFactorAuthKeyFromKeychain()
            .then((key) => {
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
            })
            .catch((err) => console.error(err)); // generate an alert.
    }

    render() {
        const { negativeColor, secondaryBackgroundColor, t } = this.props;
        const backgroundColor = { backgroundColor: this.props.backgroundColor };
        const textColor = { color: secondaryBackgroundColor };
        const iotaLogoImagePath = secondaryBackgroundColor === 'white' ? whiteIotaImagePath : blackIotaImagePath;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={[styles.container, backgroundColor]}>
                    <DynamicStatusBar
                        textColor={secondaryBackgroundColor}
                        backgroundColor={this.props.backgroundColor}
                    />
                    <View style={styles.topWrapper}>
                        <Image source={iotaLogoImagePath} style={styles.iotaLogo} />
                    </View>
                    <View style={styles.midWrapper}>
                        <View style={{ flex: 0.25 }} />
                        <Text style={[styles.subHeaderText, textColor]}>{t('enterCode')}</Text>
                        <CustomTextInput
                            label={t('code')}
                            onChangeText={(code) => this.setState({ code })}
                            containerStyle={{ width: width / 1.2 }}
                            autoCapitalize={'none'}
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="done"
                            onSubmitEditing={this.check2FA}
                            secondaryBackgroundColor={secondaryBackgroundColor}
                            negativeColor={negativeColor}
                        />
                    </View>
                    <View style={styles.bottomWrapper}>
                        <OnboardingButtons
                            onLeftButtonPress={this.goBack}
                            onRightButtonPress={this.check2FA}
                            leftText={t('global:back')}
                            rightText={t('global:done')}
                        />
                    </View>
                    <StatefulDropdownAlert />
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
    backgroundColor: state.settings.theme.backgroundColor,
    positiveColor: state.settings.theme.positiveColor,
    negativeColor: state.settings.theme.negativeColor,
    secondaryBackgroundColor: state.settings.theme.secondaryBackgroundColor,
});

export default translate(['twoFA', 'global'])(connect(mapStateToProps, mapDispatchToProps)(TwoFactorSetupEnterToken));
