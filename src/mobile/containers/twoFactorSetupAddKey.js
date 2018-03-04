import React, { Component } from 'react';
import PropTypes from 'prop-types';
import authenticator from 'authenticator';
import { set2FAKey, set2FAStatus } from 'iota-wallet-shared-modules/actions/account';
import whiteIotaImagePath from 'iota-wallet-shared-modules/images/iota-white.png';
import blackIotaImagePath from 'iota-wallet-shared-modules/images/iota-black.png';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, Image, Clipboard, TouchableOpacity, BackHandler } from 'react-native';
import DynamicStatusBar from '../components/dynamicStatusBar';
import { Navigation } from 'react-native-navigation';
import QRCode from 'react-native-qrcode-svg';
import Fonts from '../theme/Fonts';
import OnboardingButtons from '../components/onboardingButtons';
import StatefulDropdownAlert from './statefulDropdownAlert';
import GENERAL from '../theme/general';
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
        marginBottom: height / 15,
    },
    infoText: {
        fontSize: width / 27.6,
        textAlign: 'center',
        paddingTop: height / 60,
        backgroundColor: 'transparent',
    },
    infoTextLight: {
        fontFamily: Fonts.tertiary,
        fontSize: width / 27.6,
        backgroundColor: 'transparent',
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
    qrContainer: {
        backgroundColor: 'white',
        borderRadius: GENERAL.borderRadiusLarge,
        padding: width / 30,
        marginBottom: height / 25,
    },
});

class TwoFactorSetupAddKey extends Component {
    static propTypes = {
        backgroundColor: PropTypes.object.isRequired,
        negativeColor: PropTypes.object.isRequired,
        generateAlert: PropTypes.func.isRequired,
        set2FAKey: PropTypes.func.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        navigator: PropTypes.object.isRequired,
    };

    constructor() {
        super();
        this.goBack = this.goBack.bind(this);
        this.navigateToEnterToken = this.navigateToEnterToken.bind(this);
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

    onKeyPress(address) {
        if (address !== ' ') {
            Clipboard.setString(address);
            this.props.generateAlert(
                'success',
                'Key copied to clipboard',
                'Your 2FA key has been copied to the clipboard.',
            );
        }
    }

    goBack() {
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
            appStyle: {
                orientation: 'portrait',
            },
        });
    }

    navigateToEnterToken() {
        this.props.set2FAKey(this.state.authkey);
        Clipboard.setString(' ');
        this.props.navigator.push({
            screen: 'twoFactorSetupEnterToken',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                screenBackgroundColor: THEMES.getHSL(this.props.backgroundColor),
            },
            animated: false,
            appStyle: {
                orientation: 'portrait',
            },
        });
    }

    render() {
        const { t, negativeColor, secondaryBackgroundColor } = this.props;
        const backgroundColor = { backgroundColor: THEMES.getHSL(this.props.backgroundColor) };
        const textColor = { color: secondaryBackgroundColor };
        const iotaLogoImagePath = secondaryBackgroundColor === 'white' ? whiteIotaImagePath : blackIotaImagePath;

        return (
            <View style={[styles.container, backgroundColor]}>
                <DynamicStatusBar textColor={secondaryBackgroundColor} />
                <StatefulDropdownAlert />
                <View style={styles.topWrapper}>
                    <Image source={iotaLogoImagePath} style={styles.iotaLogo} />
                </View>
                <View style={styles.midWrapper}>
                    <View style={{ flex: 0.4 }} />
                    <Text style={[styles.subHeaderText, textColor]}>Add this key to your 2FA app</Text>
                    <View style={styles.qrContainer}>
                        <QRCode
                            value={authenticator.generateTotpUri(this.state.authkey, 'Trinity Wallet Mobile')}
                            size={height / 5}
                            bgColor="#000"
                            fgColor="#FFF"
                        />
                    </View>
                    <TouchableOpacity onPress={() => this.onKeyPress(this.state.authkey)}>
                        <Text style={[styles.infoText, textColor]}>
                            <Text style={styles.infoText}>Key: </Text>
                            <Text style={styles.infoTextLight}>{this.state.authkey}</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.bottomWrapper}>
                    <OnboardingButtons
                        onLeftButtonPress={this.goBack}
                        onRightButtonPress={this.navigateToEnterToken}
                        leftText={'BACK'}
                        rightText={'NEXT'}
                    />
                </View>
            </View>
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
});

export default connect(mapStateToProps, mapDispatchToProps)(TwoFactorSetupAddKey);
