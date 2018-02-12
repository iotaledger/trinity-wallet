import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text } from 'react-native';
import { Navigation } from 'react-native-navigation';
import whiteLoadingAnimation from 'iota-wallet-shared-modules/animations/loading-white.json';
import blackLoadingAnimation from 'iota-wallet-shared-modules/animations/loading-black.json';
import whiteWelcomeAnimation from 'iota-wallet-shared-modules/animations/welcome-white.json';
import blackWelcomeAnimation from 'iota-wallet-shared-modules/animations/welcome-black.json';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import KeepAwake from 'react-native-keep-awake';
import LottieView from 'lottie-react-native';
import {
    getAccountInfo,
    getFullAccountInfo,
    fetchFullAccountInfoForFirstUse,
} from 'iota-wallet-shared-modules/actions/account';
import { getMarketData, getChartData, getPrice } from 'iota-wallet-shared-modules/actions/marketData';
import { getCurrencyData } from 'iota-wallet-shared-modules/actions/settings';
import { setSetting } from 'iota-wallet-shared-modules/actions/tempAccount';
import { changeHomeScreenRoute } from 'iota-wallet-shared-modules/actions/home';
import { getSelectedAccountNameViaSeedIndex } from 'iota-wallet-shared-modules/selectors/account';
import keychain, { getSeed, storeSeedInKeychain } from '../util/keychain';
import DynamicStatusBar from '../components/dynamicStatusBar';

import { width, height } from '../util/dimensions';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        textAlign: 'center',
        paddingBottom: height / 30,
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: height / 40,
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
});

class Loading extends Component {
    static propTypes = {
        firstUse: PropTypes.bool.isRequired,
        addingAdditionalAccount: PropTypes.bool.isRequired,
        navigator: PropTypes.object.isRequired,
        getAccountInfo: PropTypes.func.isRequired,
        getFullAccountInfo: PropTypes.func.isRequired,
        fetchFullAccountInfoForFirstUse: PropTypes.func.isRequired,
        selectedAccountName: PropTypes.string.isRequired,
        backgroundColor: PropTypes.string.isRequired,
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
        secondaryBackgroundColor: PropTypes.string.isRequired,
        setSetting: PropTypes.func.isRequired,
        changeHomeScreenRoute: PropTypes.func.isRequired,
    };
    constructor() {
        super();
        this.state = {
            elipsis: '',
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
        } = this.props;
        this.getWalletData();
        this.animation.play();
        this.animateElipses(['.', '..', ''], 0);
        KeepAwake.activate();
        this.props.changeHomeScreenRoute('balance');
        this.props.setSetting('mainSettings');

        keychain
            .get()
            .then((credentials) => {
                const firstSeed = getSeed(credentials.data, 0);

                if (firstUse && !addingAdditionalAccount) {
                    this.props.getFullAccountInfo(firstSeed, selectedAccountName, navigator);
                } else if (!firstUse && addingAdditionalAccount) {
                    this.props.fetchFullAccountInfoForFirstUse(
                        seed,
                        additionalAccountName,
                        password,
                        storeSeedInKeychain,
                        navigator,
                    );
                } else {
                    this.props.getAccountInfo(firstSeed, selectedAccountName, navigator);
                }
            })
            .catch((err) => console.log(err)); // Dropdown
    }

    componentWillReceiveProps(newProps) {
        const { ready } = this.props;
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
                        screenBackgroundColor: this.props.backgroundColor,
                    },
                },
                appStyle: {
                    orientation: 'portrait',
                },
            });
        }
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    getWalletData() {
        const { currency } = this.props;
        this.props.getPrice();
        this.props.getChartData();
        this.props.getMarketData();
        this.props.getCurrencyData(currency);
    }

    animateElipses = (chars, index, timer = 750) => {
        this.timeout = setTimeout(() => {
            this.setState({ elipsis: chars[index] });
            const next = index === chars.length - 1 ? 0 : index + 1;
            this.animateElipses(chars, next);
        }, timer);
    };

    render() {
        const { firstUse, t, addingAdditionalAccount, backgroundColor, secondaryBackgroundColor } = this.props;
        const textColor = { color: secondaryBackgroundColor };
        const loadingAnimationPath =
            secondaryBackgroundColor === 'white' ? whiteLoadingAnimation : blackLoadingAnimation;
        const welcomeAnimationPath =
            secondaryBackgroundColor === 'white' ? whiteWelcomeAnimation : blackWelcomeAnimation;

        if (firstUse || addingAdditionalAccount) {
            return (
                <View style={[styles.container, { backgroundColor }]}>
                    <DynamicStatusBar textColor={secondaryBackgroundColor} />
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
                    <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: height / 15 }}>
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={[styles.infoText, textColor]}>{t('thisMayTake')}</Text>
                                <View style={{ alignItems: 'flex-start', width: width / 30 }}>
                                    <Text style={[styles.infoText, textColor]}>{this.state.elipsis}</Text>
                                </View>
                            </View>

                            <Text style={[styles.infoText, textColor]}>{t('loadingFirstTime')}</Text>
                        </View>
                    </View>
                </View>
            );
        }

        return (
            <View style={[styles.container, { backgroundColor }]}>
                <DynamicStatusBar textColor={secondaryBackgroundColor} />
                <View style={styles.animationContainer}>
                    <View>
                        <LottieView
                            ref={(animation) => {
                                this.animation = animation;
                            }}
                            source={welcomeAnimationPath}
                            style={styles.animationLoading}
                            loop
                        />
                    </View>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    firstUse: state.account.firstUse,
    selectedAccountName: getSelectedAccountNameViaSeedIndex(state.tempAccount.seedIndex, state.account.seedNames),
    addingAdditionalAccount: state.tempAccount.addingAdditionalAccount,
    additionalAccountName: state.tempAccount.additionalAccountName,
    seed: state.tempAccount.seed,
    ready: state.tempAccount.ready,
    password: state.tempAccount.password,
    backgroundColor: state.settings.theme.backgroundColor,
    negativeColor: state.settings.theme.negativeColor,
    secondaryBackgroundColor: state.settings.theme.secondaryBackgroundColor,
    currency: state.settings.currency,
});

const mapDispatchToProps = {
    changeHomeScreenRoute,
    setSetting,
    getAccountInfo,
    getFullAccountInfo,
    fetchFullAccountInfoForFirstUse,
    getMarketData,
    getPrice,
    getChartData,
    getCurrencyData,
};

export default translate('loading')(connect(mapStateToProps, mapDispatchToProps)(Loading));
