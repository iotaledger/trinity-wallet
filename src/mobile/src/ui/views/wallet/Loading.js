import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text } from 'react-native';
import timer from 'react-native-timer';
import whiteLoadingAnimation from 'shared-modules/animations/loading-white.json';
import blackLoadingAnimation from 'shared-modules/animations/loading-black.json';
import { navigator } from 'libs/navigation';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import KeepAwake from 'react-native-keep-awake';
import LottieView from 'lottie-react-native';
import { getAccountInfo, getFullAccountInfo } from 'shared-modules/actions/accounts';
import { setLoginRoute } from 'shared-modules/actions/ui';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { getMarketData, getChartData, getPrice } from 'shared-modules/actions/marketData';
import { getCurrencyData } from 'shared-modules/actions/settings';
import { setSetting } from 'shared-modules/actions/wallet';
import { changeHomeScreenRoute } from 'shared-modules/actions/home';
import {
    getSelectedAccountName,
    getSelectedAccountMeta,
    getAccountNamesFromState,
    isSettingUpNewAccount,
} from 'shared-modules/selectors/accounts';
import { Styling } from 'ui/theme/general';
import SeedStore from 'libs/SeedStore';
import { isAndroid, isIPhoneX } from 'libs/device';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import SingleFooterButton from 'ui/components/SingleFooterButton';
import AnimatedComponent from 'ui/components/AnimatedComponent';

import { width, height } from 'libs/dimensions';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
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
        paddingBottom: isIPhoneX ? height / 40 : height / 20,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        width,
    },
    loadingAnimationContainer: {
        height,
        justifyContent: 'center',
    },
});

/** Loading screen component */
class Loading extends Component {
    static propTypes = {
        /** @ignore */
        addingAdditionalAccount: PropTypes.bool.isRequired,
        /** @ignore */
        getAccountInfo: PropTypes.func.isRequired,
        /** @ignore */
        hasErrorFetchingAccountInfo: PropTypes.bool.isRequired,
        /** @ignore */
        getFullAccountInfo: PropTypes.func.isRequired,
        /** @ignore */
        hasErrorFetchingFullAccountInfo: PropTypes.bool.isRequired,
        /** Name for currently selected account */
        selectedAccountName: PropTypes.string,
        /** Name for currently selected account */
        selectedAccountMeta: PropTypes.object.isRequired,
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
        /** All stored account names */
        accountNames: PropTypes.array.isRequired,
        /** @ignore */
        isThemeDark: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            elipsis: '',
            displayNodeChangeOption: false,
            animationCycleComplete: false,
            addingAdditionalAccount: props.addingAdditionalAccount,
        };
        this.onChangeNodePress = this.onChangeNodePress.bind(this);
    }

    async componentDidMount() {
        const {
            addingAdditionalAccount,
            additionalAccountName,
            additionalAccountMeta,
            selectedAccountName,
            selectedAccountMeta,
            deepLinkActive,
        } = this.props;
        leaveNavigationBreadcrumb('Loading');
        this.props.setLoginRoute('login');
        KeepAwake.activate();
        this.animation.play();
        // Ensures animation completes at least one cycle
        timer.setTimeout('animationTimeout', () => this.setState({ animationCycleComplete: true }), 3000);
        if (addingAdditionalAccount) {
            timer.setTimeout('waitTimeout', () => this.onWaitTimeout(), 150000);
            if (!isAndroid) {
                this.animateElipses(['.', '..', ''], 0);
            }
        } else {
            timer.setTimeout('waitTimeout', () => this.onWaitTimeout(), 15000);
        }
        this.props.setSetting('mainSettings');
        this.getWalletData();
        if (deepLinkActive) {
            this.props.changeHomeScreenRoute('send');
        } else {
            this.props.changeHomeScreenRoute('balance');
        }
        if (addingAdditionalAccount) {
            const seedStore = await new SeedStore[additionalAccountMeta.type](
                global.passwordHash,
                additionalAccountName,
            );
            this.props.getFullAccountInfo(seedStore, additionalAccountName);
        } else {
            const seedStore = await new SeedStore[selectedAccountMeta.type](global.passwordHash, selectedAccountName);
            this.props.getAccountInfo(seedStore, selectedAccountName);
        }
    }

    componentWillReceiveProps(newProps) {
        const { ready, hasErrorFetchingAccountInfo, hasErrorFetchingFullAccountInfo, accountNames } = this.props;
        const isReady = !ready && newProps.ready;
        if (isReady && this.state.animationCycleComplete) {
            this.launchHomeScreen();
        }
        if (!hasErrorFetchingAccountInfo && newProps.hasErrorFetchingAccountInfo) {
            this.redirectToLogin();
        }
        if (!hasErrorFetchingFullAccountInfo && newProps.hasErrorFetchingFullAccountInfo) {
            if (accountNames.length <= 1) {
                this.redirectToLogin();
            } else {
                this.redirectToHome();
            }
        }
    }

    componentWillUpdate(newProps, newState) {
        if (
            this.state.animationCycleComplete !== newState.animationCycleComplete &&
            this.props.ready &&
            newState.animationCycleComplete
        ) {
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
        this.props.setLoginRoute('nodeSelection');
        this.redirectToLogin();
    }

    getWalletData() {
        const { currency } = this.props;
        this.props.getPrice();
        this.props.getChartData();
        this.props.getMarketData();
        this.props.getCurrencyData(currency);
    }

    /**
     * Navigates to home screen
     *
     * @method launchHomeScreen
     */
    launchHomeScreen() {
        KeepAwake.deactivate();
        this.redirectToHome();
        this.clearTimeouts();
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

    /**
     * Redirect to login page
     *
     * @method redirectToLogin
     */
    redirectToLogin() {
        navigator.setStackRoot('login');
    }

    /**
     * Redirect to home page
     *
     * @method redirectToHome
     */
    redirectToHome() {
        navigator.setStackRoot('home');
    }

    render() {
        const { t, theme: { body, primary }, isThemeDark } = this.props;
        const textColor = { color: body.color };
        const loadingAnimationPath = isThemeDark ? whiteLoadingAnimation : blackLoadingAnimation;

        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <View style={styles.animationContainer}>
                    <AnimatedComponent
                        animationInType={['fadeIn']}
                        animationOutType={['fadeOut']}
                        delay={0}
                        style={styles.loadingAnimationContainer}
                    >
                        <LottieView
                            ref={(animation) => {
                                this.animation = animation;
                            }}
                            source={loadingAnimationPath}
                            style={styles.animationNewSeed}
                            loop
                        />
                    </AnimatedComponent>
                </View>
                <AnimatedComponent
                    animationInType={['fadeIn']}
                    animationOutType={['fadeOut']}
                    delay={0}
                    style={styles.bottomContainer}
                >
                    <View>
                        {(this.state.addingAdditionalAccount && (
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
                        )) ||
                            (this.state.displayNodeChangeOption && (
                                <View>
                                    <Text style={[styles.infoText, textColor]}>{t('takingAWhile')}...</Text>
                                    <SingleFooterButton
                                        onButtonPress={this.onChangeNodePress}
                                        buttonStyle={{
                                            wrapper: { backgroundColor: primary.color },
                                            children: { color: primary.body },
                                        }}
                                        buttonText={t('global:changeNode')}
                                    />
                                </View>
                            ))}
                    </View>
                </AnimatedComponent>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    selectedAccountName: getSelectedAccountName(state),
    selectedAccountMeta: getSelectedAccountMeta(state),
    accountNames: getAccountNamesFromState(state),
    hasErrorFetchingAccountInfo: state.ui.hasErrorFetchingAccountInfo,
    hasErrorFetchingFullAccountInfo: state.ui.hasErrorFetchingFullAccountInfo,
    addingAdditionalAccount: isSettingUpNewAccount(state),
    additionalAccountName: state.accounts.accountInfoDuringSetup.name,
    additionalAccountMeta: state.accounts.accountInfoDuringSetup.meta,
    ready: state.wallet.ready,
    theme: getThemeFromState(state),
    isThemeDark: getThemeFromState(state).isDark,
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

export default withNamespaces(['loading', 'global'])(connect(mapStateToProps, mapDispatchToProps)(Loading));
