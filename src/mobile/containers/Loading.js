import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import timer from 'react-native-timer';
import whiteLoadingAnimation from 'iota-wallet-shared-modules/animations/loading-white.json';
import blackLoadingAnimation from 'iota-wallet-shared-modules/animations/loading-black.json';
import whiteWelcomeAnimationPartOne from 'iota-wallet-shared-modules/animations/welcome-part-one-white.json';
import whiteWelcomeAnimationPartTwo from 'iota-wallet-shared-modules/animations/welcome-part-two-white.json';
import blackWelcomeAnimationPartOne from 'iota-wallet-shared-modules/animations/welcome-part-one-black.json';
import blackWelcomeAnimationPartTwo from 'iota-wallet-shared-modules/animations/welcome-part-two-black.json';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import KeepAwake from 'react-native-keep-awake';
import LottieView from 'lottie-react-native';
import {
    getAccountInfo,
    getFullAccountInfoFirstSeed,
    getFullAccountInfoAdditionalSeed,
} from 'iota-wallet-shared-modules/actions/accounts';
import { setLoginRoute } from 'iota-wallet-shared-modules/actions/ui';
import tinycolor from 'tinycolor2';
import { getMarketData, getChartData, getPrice } from 'iota-wallet-shared-modules/actions/marketData';
import { Navigation } from 'react-native-navigation';
import { getCurrencyData } from 'iota-wallet-shared-modules/actions/settings';
import { setSetting } from 'iota-wallet-shared-modules/actions/wallet';
import { changeHomeScreenRoute } from 'iota-wallet-shared-modules/actions/home';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { getSelectedAccountName } from 'iota-wallet-shared-modules/selectors/accounts';
import GENERAL from '../theme/general';
import { getSeedFromKeychain, storeSeedInKeychain } from '../utils/keychain';
import DynamicStatusBar from '../components/DynamicStatusBar';
import { getAddressGenFn, getMultiAddressGenFn } from '../utils/nativeModules';
import { isAndroid } from '../utils/device';

import { width, height } from '../utils/dimensions';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
        textAlign: 'center',
        paddingBottom: height / 40,
    },
    animationLoading: {
        justifyContent: 'center',
        width: width * 1.5,
        height: width / 1.77 * 1.5,
    },
    animationNewSeed: {
        justifyContent: 'center',
        width: width / 2.5,
        height: width / 2.5,
    },
    animationContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: height / 30,
    },
    infoTextContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingBottom: height / 20,
    },
    changeNodeButton: {
        borderWidth: 1.5,
        borderRadius: GENERAL.borderRadius,
        width: width / 2.7,
        height: height / 17,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    nodeChangeButton: {
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
        width: width / 2.7,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginTop: height / 50,
    },
    nodeChangeText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
    },
    nodeChangeContainer: {
        position: 'absolute',
        bottom: height / 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

/** Loading screen component */
class Loading extends Component {
    static propTypes = {
        /** Determines whether this is the first time user is going to log in */
        firstUse: PropTypes.bool.isRequired,
        /** Determines whether user is adding an additional account */
        addingAdditionalAccount: PropTypes.bool.isRequired,
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** Fetch latest account info from the tangle
         * @param {string} seed
         * @param {string} accountName
         * @param {string} navigationObject
         * @param {string} genFn - Native address generation function
         */
        getAccountInfo: PropTypes.func.isRequired,
        /** Fetch latest account info for first account
         * @param {string} seed
         * @param {string} accountName
         * @param {string} navigationObject
         * @param {string} genFn - Native address generation function
         */
        getFullAccountInfoFirstSeed: PropTypes.func.isRequired,
        /** Fetch latest account info for additional account
         * @param {string} seed
         * @param {string} accountName
         * @param {string} passwordHash
         * @param {promise} storeInKeychainPromise
         * @param {string} navigationObject
         * @param {string} genFn - Native address generation function
         */
        getFullAccountInfoAdditionalSeed: PropTypes.func.isRequired,
        /** Name for currently selected account */
        selectedAccountName: PropTypes.string.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Fetch latest market information */
        getMarketData: PropTypes.func.isRequired,
        /** Fetch latest price information */
        getPrice: PropTypes.func.isRequired,
        /** Fetch latest chart information */
        getChartData: PropTypes.func.isRequired,
        /** Fetch latest currency information
         * @param {string} currency
         */
        getCurrencyData: PropTypes.func.isRequired,
        /** Additional account name */
        additionalAccountName: PropTypes.string.isRequired,
        /** Hash for wallet's password */
        password: PropTypes.string.isRequired,
        /** Seed value */
        seed: PropTypes.string.isRequired,
        /** Currently selected currency */
        currency: PropTypes.string.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Determines if the account information was successfully fetched from the tangle */
        ready: PropTypes.bool.isRequired,
        /** Change current setting
         * @param {string} setting
         */
        setSetting: PropTypes.func.isRequired,
        /** Updates home screen children route name
         * @param {string} name - route name
         */
        changeHomeScreenRoute: PropTypes.func.isRequired,
        /** Generate a notification alert
         * @param {String} type - notification type - success, error
         * @param {String} title - notification title
         * @param {String} text - notification explanation
         */
        generateAlert: PropTypes.func.isRequired,
        /** If user has opened a deep link */
        deepLinkActive: PropTypes.bool.isRequired,
        /** Sets which login page should be displayed
         * @param {string} route - current route
         */
        setLoginRoute: PropTypes.func.isRequired,
    };

    constructor() {
        super();
        this.state = {
            elipsis: '',
            animationPartOneDone: false,
            displayNodeChangeOption: false,
        };
        this.onChangeNodePress = this.onChangeNodePress.bind(this);
    }

    componentDidMount() {
        const {
            firstUse,
            addingAdditionalAccount,
            additionalAccountName,
            selectedAccountName,
            seed,
            password,
            navigator,
            t,
            deepLinkActive,
        } = this.props;
        this.animation.play();
        if (!firstUse && !addingAdditionalAccount) {
            this.setAnimationOneTimout();
            timer.setTimeout('waitTimeout', () => this.onWaitTimeout(), 15000);
        }
        this.getWalletData();
        if ((firstUse || addingAdditionalAccount) && !isAndroid) {
            this.animateElipses(['.', '..', ''], 0);
        }
        KeepAwake.activate();
        if (deepLinkActive) {
            this.props.changeHomeScreenRoute('send');
        } else {
            this.props.changeHomeScreenRoute('balance');
        }
        this.props.setSetting('mainSettings');

        let genFn = null;

        if (firstUse || addingAdditionalAccount) {
            genFn = getMultiAddressGenFn();
        } else {
            genFn = getAddressGenFn();
        }

        if (!firstUse && addingAdditionalAccount) {
            return this.props.getFullAccountInfoAdditionalSeed(
                seed,
                additionalAccountName,
                password,
                storeSeedInKeychain,
                navigator,
                genFn,
            );
        }

        getSeedFromKeychain(password, selectedAccountName).then((currentSeed) => {
            if (currentSeed === null) {
                return this.props.generateAlert(
                    'error',
                    t('global:somethingWentWrong'),
                    t('global:somethingWentWrongRestart'),
                );
            }
            if (firstUse) {
                this.props.getFullAccountInfoFirstSeed(currentSeed, selectedAccountName, navigator, genFn);
            } else {
                this.props.getAccountInfo(currentSeed, selectedAccountName, navigator, genFn);
            }
        });
    }

    componentWillReceiveProps(newProps) {
        const { ready, theme: { body, bar } } = this.props;
        const isReady = !ready && newProps.ready;

        if (isReady) {
            KeepAwake.deactivate();
            this.clearTimeouts();
            // FIXME: A quick workaround to stop history refresh flash on iOS.
            if (isAndroid) {
                this.props.navigator.push({
                    screen: 'home',
                    navigatorStyle: {
                        navBarHidden: true,
                        navBarTransparent: true,
                        topBarElevationShadowEnabled: false,
                        screenBackgroundColor: body.bg,
                        drawUnderStatusBar: true,
                        statusBarColor: bar.bg,
                    },
                    animated: false,
                });
                timer.clearInterval('inactivityTimer');
            } else {
                Navigation.startSingleScreenApp({
                    screen: {
                        screen: 'home',
                        navigatorStyle: {
                            navBarHidden: true,
                            navBarTransparent: true,
                            topBarElevationShadowEnabled: false,
                            screenBackgroundColor: body.bg,
                            drawUnderStatusBar: true,
                            statusBarColor: bar.bg,
                        },
                    },
                    appStyle: {
                        orientation: 'portrait',
                        keepStyleAcrossPush: true,
                    },
                });
            }
        }
    }

    componentWillUnmount() {
        this.clearTimeouts();
    }

    onWaitTimeout() {
        this.setState({ displayNodeChangeOption: true });
    }

    onChangeNodePress() {
        const { theme: { body } } = this.props;
        this.props.setLoginRoute('nodeSelection');
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'login',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    topBarElevationShadowEnabled: false,
                    screenBackgroundColor: body.bg,
                    drawUnderStatusBar: true,
                    statusBarColor: body.bg,
                },
            },
            appStyle: {
                orientation: 'portrait',
                keepStyleAcrossPush: true,
            },
        });
    }

    getWalletData() {
        const { currency } = this.props;
        this.props.getPrice();
        this.props.getChartData();
        this.props.getMarketData();
        this.props.getCurrencyData(currency);
    }

    setAnimationOneTimout() {
        timer.setTimeout('animationTimeout', () => this.playAnimationTwo(), 2000);
    }

    playAnimationTwo() {
        this.setState({ animationPartOneDone: true });
        this.animation.play();
    }

    clearTimeouts() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        timer.clearTimeout('animationTimeout');
        timer.clearTimeout('waitTimeout');
    }

    animateElipses = (chars, index, time = 750) => {
        this.timeout = setTimeout(() => {
            this.setState({ elipsis: chars[index] });
            const next = index === chars.length - 1 ? 0 : index + 1;
            this.animateElipses(chars, next);
        }, time);
    };

    render() {
        const { firstUse, t, addingAdditionalAccount, theme: { body, primary } } = this.props;
        const { displayNodeChangeOption } = this.state;
        const textColor = { color: body.color };
        const isBgLight = tinycolor(body.bg).isLight();
        const loadingAnimationPath = isBgLight ? blackLoadingAnimation : whiteLoadingAnimation;
        const welcomeAnimationPartOnePath = isBgLight ? blackWelcomeAnimationPartOne : whiteWelcomeAnimationPartOne;
        const welcomeAnimationPartTwoPath = isBgLight ? blackWelcomeAnimationPartTwo : whiteWelcomeAnimationPartTwo;
        const primaryTextColor = { color: primary.color };
        const borderColor = { borderColor: primary.color };

        if (firstUse || addingAdditionalAccount) {
            return (
                <View style={[styles.container, { backgroundColor: body.bg }]}>
                    <DynamicStatusBar backgroundColor={body.bg} />
                    <View style={{ flex: 1 }} />
                    <View style={styles.animationContainer}>
                        <View>
                            <LottieView
                                ref={(animation) => {
                                    this.animation = animation;
                                }}
                                source={loadingAnimationPath}
                                style={styles.animationNewSeed}
                                loop
                            />
                        </View>
                    </View>
                    <View style={styles.infoTextContainer}>
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={[styles.infoText, textColor]}>{t('loadingFirstTime')}</Text>
                            <Text style={[styles.infoText, textColor]}>{t('doNotMinimise')}</Text>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={[styles.infoText, textColor]}>{t('thisMayTake')}</Text>
                                <View style={{ alignItems: 'flex-start', width: width / 30 }}>
                                    <Text style={[styles.infoText, textColor]}>
                                        {isAndroid ? '..' : this.state.elipsis}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            );
        }

        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <DynamicStatusBar backgroundColor={body.bg} />
                <View style={styles.animationContainer}>
                    <View>
                        {(!this.state.animationPartOneDone && (
                            <LottieView
                                ref={(animation) => {
                                    this.animation = animation;
                                }}
                                source={welcomeAnimationPartOnePath}
                                style={styles.animationLoading}
                            />
                        )) || (
                            <LottieView
                                ref={(animation) => {
                                    this.animation = animation;
                                }}
                                source={welcomeAnimationPartTwoPath}
                                style={styles.animationLoading}
                                loop
                            />
                        )}
                    </View>
                    {displayNodeChangeOption && (
                        <View style={styles.nodeChangeContainer}>
                            <Text style={[styles.infoText, textColor]}>{t('takingAWhile')}...</Text>
                            <TouchableOpacity onPress={this.onChangeNodePress}>
                                <View style={[styles.nodeChangeButton, borderColor]}>
                                    <Text style={[styles.nodeChangeText, primaryTextColor]}>
                                        {t('global:changeNode').toUpperCase()}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    firstUse: state.accounts.firstUse,
    selectedAccountName: getSelectedAccountName(state),
    addingAdditionalAccount: state.wallet.addingAdditionalAccount,
    additionalAccountName: state.wallet.additionalAccountName,
    seed: state.wallet.seed,
    ready: state.wallet.ready,
    password: state.wallet.password,
    theme: state.settings.theme,
    currency: state.settings.currency,
    deepLinkActive: state.wallet.deepLinkActive,
});

const mapDispatchToProps = {
    changeHomeScreenRoute,
    setSetting,
    getAccountInfo,
    getFullAccountInfoFirstSeed,
    getFullAccountInfoAdditionalSeed,
    getMarketData,
    getPrice,
    getChartData,
    getCurrencyData,
    generateAlert,
    setLoginRoute,
};

export default translate(['loading', 'global'])(connect(mapStateToProps, mapDispatchToProps)(Loading));
