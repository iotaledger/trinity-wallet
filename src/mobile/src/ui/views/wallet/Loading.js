import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text } from 'react-native';
import timer from 'react-native-timer';
import whiteLoadingAnimation from 'shared-modules/animations/loading-white.json';
import blackLoadingAnimation from 'shared-modules/animations/loading-black.json';
import whiteWelcomeAnimationPartOne from 'shared-modules/animations/welcome-part-one-white.json';
import whiteWelcomeAnimationPartTwo from 'shared-modules/animations/welcome-part-two-white.json';
import blackWelcomeAnimationPartOne from 'shared-modules/animations/welcome-part-one-black.json';
import blackWelcomeAnimationPartTwo from 'shared-modules/animations/welcome-part-two-black.json';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import KeepAwake from 'react-native-keep-awake';
import LottieView from 'lottie-react-native';
import { getAccountInfo, getFullAccountInfo } from 'shared-modules/actions/accounts';
import { setLoginRoute } from 'shared-modules/actions/ui';
import tinycolor from 'tinycolor2';
import { getMarketData, getChartData, getPrice } from 'shared-modules/actions/marketData';
import { getCurrencyData } from 'shared-modules/actions/settings';
import { setSetting } from 'shared-modules/actions/wallet';
import { changeHomeScreenRoute } from 'shared-modules/actions/home';
import { getSelectedAccountName, getSelectedAccountMeta } from 'shared-modules/selectors/accounts';
import GENERAL from 'ui/theme/general';
import SeedStore from 'libs/SeedStore';
import DynamicStatusBar from 'ui/components/DynamicStatusBar';
import StatefulDropdownAlert from 'ui/components/StatefulDropdownAlert';
import { isAndroid } from 'libs/device';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import Button from 'ui/components/Button';

import { width, height } from 'libs/dimensions';

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
        paddingBottom: height / 30,
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
    nodeChangeContainer: {
        position: 'absolute',
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

/** Loading screen component */
class Loading extends Component {
    static propTypes = {
        /** @ignore */
        addingAdditionalAccount: PropTypes.bool.isRequired,
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** @ignore */
        getAccountInfo: PropTypes.func.isRequired,
        /** @ignore */
        getFullAccountInfo: PropTypes.func.isRequired,
        /** Name for currently selected account */
        selectedAccountName: PropTypes.string,
        /** Name for currently selected account */
        selectedAccountMeta: PropTypes.string.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        getMarketData: PropTypes.func.isRequired,
        /** @ignore */
        getPrice: PropTypes.func.isRequired,
        /** @ignore */
        getChartData: PropTypes.func.isRequired,
        /** @ignore */
        getCurrencyData: PropTypes.func.isRequired,
        /** @ignore */
        additionalAccountName: PropTypes.string.isRequired,
        /** @ignore */
        additionalAccountMeta: PropTypes.object.isRequired,
        /** @ignore */
        password: PropTypes.object.isRequired,
        /** @ignore */
        currency: PropTypes.string.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        ready: PropTypes.bool.isRequired,
        /** @ignore */
        setSetting: PropTypes.func.isRequired,
        /** @ignore */
        changeHomeScreenRoute: PropTypes.func.isRequired,
        /** @ignore */
        deepLinkActive: PropTypes.bool.isRequired,
        /** @ignore */
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
            addingAdditionalAccount,
            additionalAccountName,
            additionalAccountMeta,
            selectedAccountName,
            selectedAccountMeta,
            password,
            navigator,
            deepLinkActive,
        } = this.props;

        leaveNavigationBreadcrumb('Loading');
        this.animation.play();

        if (!addingAdditionalAccount) {
            this.setAnimationOneTimout();
            timer.setTimeout('waitTimeout', () => this.onWaitTimeout(), 15000);
        }
        this.getWalletData();
        if (addingAdditionalAccount && !isAndroid) {
            this.animateElipses(['.', '..', ''], 0);
        }

        KeepAwake.activate();
        if (deepLinkActive) {
            this.props.changeHomeScreenRoute('send');
        } else {
            this.props.changeHomeScreenRoute('balance');
        }
        this.props.setSetting('mainSettings');

        if (addingAdditionalAccount) {
            const seedStore = new SeedStore[additionalAccountMeta.type](password, additionalAccountName);
            this.props.getFullAccountInfo(seedStore, additionalAccountName, navigator);
        } else {
            const seedStore = new SeedStore[selectedAccountMeta.type](password, selectedAccountName);
            this.props.getAccountInfo(seedStore, selectedAccountName, navigator);
        }
    }

    componentWillReceiveProps(newProps) {
        const { ready, addingAdditionalAccount } = this.props;
        const isReady = !ready && newProps.ready;
        if ((isReady && this.state.animationPartOneDone) || (isReady && addingAdditionalAccount)) {
            this.launchHomeScreen();
        }
    }

    componentWillUpdate(newProps, newState) {
        if (this.props.ready && newState.animationPartOneDone) {
            this.launchHomeScreen();
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
        this.props.navigator.resetTo({
            screen: 'login',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                topBarElevationShadowEnabled: false,
                screenBackgroundColor: body.bg,
                drawUnderStatusBar: true,
                statusBarColor: body.bg,
            },
            animated: false,
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

    /**
     * Navigates to home screen
     *
     * @method launchHomeScreen
     */
    launchHomeScreen() {
        const { theme: { body, bar } } = this.props;
        KeepAwake.deactivate();
        this.props.navigator.resetTo({
            screen: 'home',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                topBarElevationShadowEnabled: false,
                screenBackgroundColor: body.bg,
                drawUnderStatusBar: true,
                statusBarColor: bar.alt,
            },
            animated: false,
        });
        this.clearTimeouts();
        this.setState({ animationPartOneDone: false, displayNodeChangeOption: false });
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
        timer.clearTimeout('inactivityTimer');
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
        const { t, addingAdditionalAccount, theme: { body, primary } } = this.props;
        const { displayNodeChangeOption } = this.state;
        const textColor = { color: body.color };
        const isBgLight = tinycolor(body.bg).isLight();
        const loadingAnimationPath = isBgLight ? blackLoadingAnimation : whiteLoadingAnimation;
        const welcomeAnimationPartOnePath = isBgLight ? blackWelcomeAnimationPartOne : whiteWelcomeAnimationPartOne;
        const welcomeAnimationPartTwoPath = isBgLight ? blackWelcomeAnimationPartTwo : whiteWelcomeAnimationPartTwo;

        if (addingAdditionalAccount) {
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
                    <StatefulDropdownAlert textColor={body.color} backgroundColor={body.bg} />
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
                            <Button
                                onPress={this.onChangeNodePress}
                                style={{
                                    wrapper: { backgroundColor: primary.color },
                                    children: { color: primary.body },
                                }}
                            >
                                {t('global:changeNode')}
                            </Button>
                        </View>
                    )}
                </View>
                <StatefulDropdownAlert textColor={body.color} backgroundColor={body.bg} />
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    selectedAccountName: getSelectedAccountName(state),
    selectedAccountMeta: getSelectedAccountMeta(state),
    addingAdditionalAccount: state.wallet.addingAdditionalAccount,
    additionalAccountName: state.wallet.additionalAccountName,
    additionalAccountMeta: state.wallet.additionalAccountMeta,
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
    getFullAccountInfo,
    getMarketData,
    getPrice,
    getChartData,
    getCurrencyData,
    setLoginRoute,
};

export default translate(['loading', 'global'])(connect(mapStateToProps, mapDispatchToProps)(Loading));
