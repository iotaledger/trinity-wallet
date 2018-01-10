import React, { Component } from 'react';
import PropTypes from 'prop-types';
import authenticator from 'authenticator';
import { set2FAKey, set2FAStatus } from 'iota-wallet-shared-modules/actions/account';
import whiteIotaImagePath from 'iota-wallet-shared-modules/images/iota-white.png';
import blackIotaImagePath from 'iota-wallet-shared-modules/images/iota-black.png';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, Image, TouchableWithoutFeedback, Keyboard, BackHandler } from 'react-native';
import DynamicStatusBar from '../components/dynamicStatusBar';
import { Navigation } from 'react-native-navigation';
import { TextField } from 'react-native-material-textfield';
import QRCode from 'react-native-qrcode-svg';
import Fonts from '../theme/Fonts';
import OnboardingButtons from '../components/onboardingButtons';
import StatefulDropdownAlert from './statefulDropdownAlert';
// import keychain, { hasDuplicateSeed, hasDuplicateAccountName, storeSeedInKeychain } from '../util/keychain';
import { width, height } from '../util/dimensions';
import THEMES from '../theme/themes';

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
        paddingTop: height / 16,
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
    subHeaderWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    subHeaderText: {
        fontFamily: Fonts.secondary,
        fontSize: width / 20.7,
        textAlign: 'center',
        backgroundColor: 'transparent',
        marginBottom: height / 8,
    },
    iotaLogo: {
        height: width / 7,
        width: width / 7,
    },
});

class TwoFactorSetupEnterToken extends Component {
    static propTypes = {
        backgroundColor: PropTypes.object.isRequired,
        negativeColor: PropTypes.object.isRequired,
        generateAlert: PropTypes.func.isRequired,
        set2FAStatus: PropTypes.func.isRequired,
        set2FAKey: PropTypes.func.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);

        this.goBack = this.goBack.bind(this);
        this.check2FA = this.check2FA.bind(this);
        this.state = {
            code: '',
            authkey: authenticator.generateKey(),
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('newSeedSetupBackPress', () => {
            this.goBack();
            return true;
        });
    }

    goBack() {
        this.props.navigator.pop({
            animated: false,
        });
        this.props.set2FAKey('');
    }

    navigateToHome() {
        // FIXME: A quick workaround to stop UI text fields breaking on android due to react-native-navigation.
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

    check2FA() {
        const value = authenticator.verifyToken(this.props.key2FA, this.state.code);
        if (value) {
            this.props.set2FAStatus(true);
            this.navigateToHome();
            this.timeout = setTimeout(() => {
                this.props.generateAlert('success', '2FA is now enabled', 'You´ve succesfully enabled 2FA');
            }, 300);
        } else {
            this.props.generateAlert('error', 'Wrong Code', 'The code you entered is not correct');
        }
    }

    render() {
        const { t, negativeColor, secondaryBackgroundColor } = this.props;
        const backgroundColor = { backgroundColor: THEMES.getHSL(this.props.backgroundColor) };
        const textColor = { color: secondaryBackgroundColor };
        const iotaLogoImagePath = secondaryBackgroundColor === 'white' ? whiteIotaImagePath : blackIotaImagePath;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={[styles.container, backgroundColor]}>
                    <DynamicStatusBar textColor={secondaryBackgroundColor} />
                    <StatefulDropdownAlert />
                    <View style={styles.topWrapper}>
                        <Image source={iotaLogoImagePath} style={styles.iotaLogo} />
                    </View>
                    <View style={styles.midWrapper}>
                        <View style={{ flex: 0.1 }} />
                        <View style={{ alignItems: 'center', flex: 1 }}>
                            <Text style={[styles.subHeaderText, textColor]}>Enter the token from your 2FA app</Text>
                            <View style={styles.textfieldsContainer}>
                                <TextField
                                    style={{ color: secondaryBackgroundColor, fontFamily: 'Lato-Light' }}
                                    labelTextStyle={{ fontFamily: 'Lato-Light' }}
                                    labelFontSize={width / 31.8}
                                    fontSize={width / 20.7}
                                    labelPadding={3}
                                    baseColor={secondaryBackgroundColor}
                                    label="Token"
                                    tintColor={THEMES.getHSL(negativeColor)}
                                    autoCorrect={false}
                                    onChangeText={code => this.setState({ code })}
                                    containerStyle={{
                                        width: width / 1.36,
                                    }}
                                    onSubmitEditing={this.check2FA}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={styles.bottomWrapper}>
                        <OnboardingButtons
                            onLeftButtonPress={this.goBack}
                            onRightButtonPress={this.check2FA}
                            leftText={'BACK'}
                            rightText={'DONE'}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}
const mapDispatchToProps = {
    set2FAStatus,
    set2FAKey,
    generateAlert,
};

const mapStateToProps = state => ({
    backgroundColor: state.settings.theme.backgroundColor,
    positiveColor: state.settings.theme.positiveColor,
    negativeColor: state.settings.theme.negativeColor,
    secondaryBackgroundColor: state.settings.theme.secondaryBackgroundColor,
    key2FA: state.account.key2FA,
});

export default connect(mapStateToProps, mapDispatchToProps)(TwoFactorSetupEnterToken);
