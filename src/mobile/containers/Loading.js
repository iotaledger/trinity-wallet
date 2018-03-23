import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, NativeModules } from 'react-native';
import { Navigation } from 'react-native-navigation';
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
import tinycolor from 'tinycolor2';
import { getMarketData, getChartData, getPrice } from 'iota-wallet-shared-modules/actions/marketData';
import { getCurrencyData } from 'iota-wallet-shared-modules/actions/settings';
import { setSetting } from 'iota-wallet-shared-modules/actions/wallet';
import { changeHomeScreenRoute } from 'iota-wallet-shared-modules/actions/home';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { getSelectedAccountName } from 'iota-wallet-shared-modules/selectors/accounts';
import { getSeedFromKeychain, storeSeedInKeychain } from '../utils/keychain';
import DynamicStatusBar from '../components/DynamicStatusBar';
import { isAndroid, isIOS } from '../utils/device';

import { width, height } from '../utils/dimensions';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 25.9,
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
});

class Loading extends Component {
    static propTypes = {
        firstUse: PropTypes.bool.isRequired,
        addingAdditionalAccount: PropTypes.bool.isRequired,
        navigator: PropTypes.object.isRequired,
        getAccountInfo: PropTypes.func.isRequired,
        getFullAccountInfoFirstSeed: PropTypes.func.isRequired,
        getFullAccountInfoAdditionalSeed: PropTypes.func.isRequired,
        selectedAccountName: PropTypes.string.isRequired,
        body: PropTypes.object.isRequired,
        getMarketData: PropTypes.func.isRequired,
        getPrice: PropTypes.func.isRequired,
        getChartData: PropTypes.func.isRequired,
        getCurrencyData: PropTypes.func.isRequired,
        additionalAccountName: PropTypes.string.isRequired,
        password: PropTypes.string.isRequired,
        seed: PropTypes.string.isRequired,
        currency: PropTypes.string.isRequired,
        t: PropTypes.func.isRequired,
        ready: PropTypes.bool.isRequired,
        setSetting: PropTypes.func.isRequired,
        changeHomeScreenRoute: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
    };

    constructor() {
        super();
        this.state = {
            elipsis: '',
            animationPartOneDone: false,
        };
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
        } = this.props;
        this.animation.play();
        if (!firstUse && !addingAdditionalAccount) {
            this.setAnimationOneTimout();
        }
        this.getWalletData();
        this.animateElipses(['.', '..', ''], 0);
        KeepAwake.activate();
        this.props.changeHomeScreenRoute('balance');
        this.props.setSetting('mainSettings');

        let genFn = null;

        if (firstUse || addingAdditionalAccount) {
            if (isAndroid) {
                //  genFn = Android address function
            } else if (isIOS) {
                genFn = NativeModules.Iota.multiAddress;
            }
        } else {
            if (isAndroid) {
                //  genFn = Android multiAddress function
            } else if (isIOS) {
                genFn = NativeModules.Iota.address;
            }
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
        const { ready, body } = this.props;
        const isReady = !ready && newProps.ready;

        if (isReady) {
            clearTimeout(this.timeout);
            KeepAwake.deactivate();
            Navigation.startSingleScreenApp({
                screen: {
                    screen: 'home',
                    navigatorStyle: {
                        navBarHidden: true,
                        navBarTransparent: true,
                        screenBackgroundColor: body.bg,
                        statusBarColor: body.bg,
                        drawUnderStatusBar: true,
                    },
                },
                appStyle: {
                    orientation: 'portrait',
                    keepStyleAcrossPush: true,
                },
            });
        }
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
        clearTimeout(this.animationTimeout);
    }

    getWalletData() {
        const { currency } = this.props;
        this.props.getPrice();
        this.props.getChartData();
        this.props.getMarketData();
        this.props.getCurrencyData(currency);
    }

    setAnimationOneTimout() {
        this.animationTimeout = setTimeout(() => this.playAnimationTwo(), 2000);
    }

    playAnimationTwo() {
        this.setState({ animationPartOneDone: true });
        this.animation.play();
    }

    animateElipses = (chars, index, timer = 750) => {
        this.timeout = setTimeout(() => {
            this.setState({ elipsis: chars[index] });
            const next = index === chars.length - 1 ? 0 : index + 1;
            this.animateElipses(chars, next);
        }, timer);
    };

    render() {
        const { firstUse, t, addingAdditionalAccount, body } = this.props;
        const textColor = { color: body.color };
        const loadingAnimationPath = tinycolor(body.bg).isDark() ? whiteLoadingAnimation : blackLoadingAnimation;
        const welcomeAnimationPartOnePath = tinycolor(body.bg).isDark()
            ? whiteWelcomeAnimationPartOne
            : blackWelcomeAnimationPartOne;
        const welcomeAnimationPartTwoPath = tinycolor(body.bg).isDark()
            ? whiteWelcomeAnimationPartTwo
            : blackWelcomeAnimationPartTwo;

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
                                    <Text style={[styles.infoText, textColor]}>{this.state.elipsis}</Text>
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
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    firstUse: state.account.firstUse,
    selectedAccountName: getSelectedAccountName(state),
    addingAdditionalAccount: state.tempAccount.addingAdditionalAccount,
    additionalAccountName: state.tempAccount.additionalAccountName,
    seed: state.tempAccount.seed,
    ready: state.tempAccount.ready,
    password: state.tempAccount.password,
    body: state.settings.theme.body,
    currency: state.settings.currency,
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
};

export default translate('loading')(connect(mapStateToProps, mapDispatchToProps)(Loading));
