import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { AsyncStorage, StyleSheet, View, Text, BackHandler } from 'react-native';
import { getVersion, getBuildNumber } from 'react-native-device-info';
import LottieView from 'lottie-react-native';
import DynamicStatusBar from '../components/dynamicStatusBar';
import whiteWelcomeAnimation from 'iota-wallet-shared-modules/animations/welcome-white.json';
import blackWelcomeAnimation from 'iota-wallet-shared-modules/animations/welcome-black.json';
import keychain from '../util/keychain';
import { width, height } from '../util/dimensions';
import { isIOS } from '../util/device';
import THEMES from '../theme/themes';
import i18next from 'i18next';
import { getLocaleFromLabel } from 'iota-wallet-shared-modules/libs/i18n';

const version = getVersion();
const build = getBuildNumber();

const FULL_VERSION = `v ${version}  (${build})`;

class InitialLoading extends Component {
    static propTypes = {
        navigator: PropTypes.object.isRequired,
        onboardingComplete: PropTypes.bool.isRequired,
        backgroundColor: PropTypes.object.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
    };

    constructor() {
        super();
        console.ignoredYellowBox = ['Setting a timer']; // eslint-disable-line no-console
        Text.defaultProps.allowFontScaling = false;
    }

    componentDidMount() {
        this.animation.play();
        this.timeout = setTimeout(this.onLoaded.bind(this), 2000);

        BackHandler.addEventListener('backPress', () => {
            BackHandler.exitApp();
            return true;
        });
    }
    componentWillMount() {
        const { language } = this.props;
        i18next.changeLanguage(getLocaleFromLabel(language));
        BackHandler.removeEventListener('backPress');
    }
    onLoaded() {
        if (!this.props.onboardingComplete) {
            this.clearKeychain();
            this.props.navigator.push({
                screen: 'languageSetup',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: THEMES.getHSL(this.props.backgroundColor),
                },
                animated: false,
                overrideBackPress: true,
            });
        } else {
            this.props.navigator.push({
                screen: 'login',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: THEMES.getHSL(this.props.backgroundColor),
                },
                animated: false,
            });
        }
    }

    clearKeychain() {
        if (isIOS) {
            keychain.clear().catch(err => console.error(err)); // eslint-disable-line no-console
        }
    }

    render() {
        const { backgroundColor, secondaryBackgroundColor } = this.props;
        const textColor = { color: secondaryBackgroundColor };
        const welcomeAnimationPath =
            secondaryBackgroundColor === 'white' ? whiteWelcomeAnimation : blackWelcomeAnimation;

        return (
            <View style={[styles.container, { backgroundColor: THEMES.getHSL(backgroundColor) }]}>
                <DynamicStatusBar textColor={secondaryBackgroundColor} />
                <View style={styles.logoContainer}>
                    <View style={styles.animationContainer}>
                        <LottieView
                            ref={animation => {
                                this.animation = animation;
                            }}
                            source={welcomeAnimationPath}
                            style={styles.animation}
                        />
                    </View>
                </View>
                <View style={styles.textContainer}>
                    <Text style={[styles.text, textColor]}>IOTA Alpha Wallet {FULL_VERSION}</Text>
                </View>
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
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    text: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 33.75,
    },
    textContainer: {
        justifyContent: 'flex-end',
        paddingBottom: height / 15,
    },
    logo: {
        width: width / 4,
        height: width / 4,
    },
    animation: {
        justifyContent: 'center',
        width: width * 1.5,
        height: width / 1.77 * 1.5,
    },
    animationContainer: {
        paddingTop: height / 40,
    },
});

const mapStateToProps = state => ({
    onboardingComplete: state.account.onboardingComplete,
    backgroundColor: state.settings.theme.backgroundColor,
    secondaryBackgroundColor: state.settings.theme.secondaryBackgroundColor,
    language: state.settings.language,
});

export default connect(mapStateToProps, null)(InitialLoading);
