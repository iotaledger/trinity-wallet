import React, { Component } from 'react';
import PropTypes from 'prop-types';
import authenticator from 'authenticator';
import { set2FAStatus } from 'iota-wallet-shared-modules/actions/account';
import whiteIotaImagePath from 'iota-wallet-shared-modules/images/iota-white.png';
import blackIotaImagePath from 'iota-wallet-shared-modules/images/iota-black.png';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, Image, TouchableWithoutFeedback, Keyboard, BackHandler } from 'react-native';
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
        BackHandler.addEventListener('newSeedSetupBackPress', () => {
            this.goBack();
            return true;
        });
    }

    goBack() {
        this.props.navigator.pop({ animated: false });
    }

    navigateToHome() {
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'home',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: this.props.backgroundColor,
                },
            },
        });
    }

    check2FA() {
        getTwoFactorAuthKeyFromKeychain()
            .then(key => {
                const verified = authenticator.verifyToken(key, this.state.code);

                if (verified) {
                    this.props.set2FAStatus(true);
                    this.navigateToHome();

                    this.timeout = setTimeout(() => {
                        this.props.generateAlert(
                            'success',
                            '2FA is now enabled',
                            'You have successfully enabled Two Factor Authentication.',
                        );
                    }, 300);
                } else {
                    this.props.generateAlert('error', 'Wrong Code', 'The code you entered is not correct');
                }
            })
            .catch(err => console.error(err)); // generate an alert.
    }

    render() {
        const { negativeColor, secondaryBackgroundColor } = this.props;
        const backgroundColor = { backgroundColor: this.props.backgroundColor };
        const textColor = { color: secondaryBackgroundColor };
        const iotaLogoImagePath = secondaryBackgroundColor === 'white' ? whiteIotaImagePath : blackIotaImagePath;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={[styles.container, backgroundColor]}>
                    <DynamicStatusBar textColor={secondaryBackgroundColor} />
                    <View style={styles.topWrapper}>
                        <Image source={iotaLogoImagePath} style={styles.iotaLogo} />
                    </View>
                    <View style={styles.midWrapper}>
                        <View style={{ flex: 0.25 }} />
                        <Text style={[styles.subHeaderText, textColor]}>Enter the token from your 2FA app</Text>
                        <CustomTextInput
                            label="Token"
                            onChangeText={code => this.setState({ code })}
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
                            leftText="BACK"
                            rightText="DONE"
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

const mapStateToProps = state => ({
    backgroundColor: state.settings.theme.backgroundColor,
    positiveColor: state.settings.theme.positiveColor,
    negativeColor: state.settings.theme.negativeColor,
    secondaryBackgroundColor: state.settings.theme.secondaryBackgroundColor,
});

export default connect(mapStateToProps, mapDispatchToProps)(TwoFactorSetupEnterToken);
