import get from 'lodash/get';
import isNull from 'lodash/isNull';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text } from 'react-native';
import timer from 'react-native-timer';
import { getAnimation } from 'shared-modules/animations';
import navigator from 'libs/navigation';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import KeepAwake from 'react-native-keep-awake';
import LottieView from 'lottie-react-native';
import { getAccountInfo, getFullAccountInfo } from 'shared-modules/actions/accounts';
import { setLoginRoute } from 'shared-modules/actions/ui';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { fetchMarketData } from 'shared-modules/actions/polling';
import {
    fetchCountries as fetchMoonPayCountries,
    fetchCurrencies as fetchMoonPayCurrencies,
    checkIPAddress,
    refreshCredentialsAndFetchMeta,
} from 'shared-modules/actions/exchanges/MoonPay';
import { setSetting } from 'shared-modules/actions/wallet';
import { changeHomeScreenRoute } from 'shared-modules/actions/home';
import { __DEV__ } from 'shared-modules/config';
import {
    getSelectedAccountName,
    getSelectedAccountMeta,
    getAccountNamesFromState,
    isSettingUpNewAccount,
} from 'shared-modules/selectors/accounts';
import { Styling } from 'ui/theme/general';
import SeedStore from 'libs/SeedStore';
import { MoonPayKeychainAdapter } from 'libs/keychain';
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
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize4,
        backgroundColor: 'transparent',
        textAlign: 'center',
        lineHeight: Styling.fontSize4 * 1.5,
    },
    animationLoading: {
        justifyContent: 'center',
        width: width * 1.5,
        height: (width / 1.77) * 1.5,
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
        paddingBottom: isIPhoneX ? height / 30 : height / 15,
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
        fetchMarketData: PropTypes.func.isRequired,
        /** @ignore */
        additionalAccountName: PropTypes.string.isRequired,
        /** @ignore */
        additionalAccountMeta: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        ready: PropTypes.bool.isRequired,
        /** @ignore */
        setSetting: PropTypes.func.isRequired,
        /** @ignore */
        changeHomeScreenRoute: PropTypes.func.isRequired,
        /** @ignore */
        deepLinkRequestActive: PropTypes.bool.isRequired,
        /** @ignore */
        setLoginRoute: PropTypes.func.isRequired,
        /** @ignore */
        fetchMoonPayCountries: PropTypes.func.isRequired,
        /** @ignore */
        fetchMoonPayCurrencies: PropTypes.func.isRequired,
        /** @ignore */
        checkIPAddress: PropTypes.func.isRequired,
        /** @ignore */
        refreshCredentialsAndFetchMeta: PropTypes.func.isRequired,
        /** All stored account names */
        accountNames: PropTypes.array.isRequired,
        /** @ignore */
        themeName: PropTypes.string.isRequired,
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
            deepLinkRequestActive,
        } = this.props;
        leaveNavigationBreadcrumb('Loading');
        this.props.setLoginRoute('login');
        KeepAwake.activate();
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

        this.getWalletData();
        this.fetchMoonPayData();

        if (!deepLinkRequestActive) {
            this.props.setSetting('mainSettings');
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
        this.props.setLoginRoute('nodeSettings');
        this.redirectToLogin();
    }

    /**
     * Fetches MoonPay data from their servers
     *
     * @method fetchMoonPayData
     *
     * @returns {void}
     */
    fetchMoonPayData() {
        this.props.fetchMoonPayCountries();
        this.props.fetchMoonPayCurrencies();
        this.props.checkIPAddress();

        MoonPayKeychainAdapter.get()
            .then((credentials) => {
                if (!isNull(credentials)) {
                    this.props.refreshCredentialsAndFetchMeta(
                        get(credentials, 'jwt'),
                        get(credentials, 'csrfToken'),
                        MoonPayKeychainAdapter,
                    );
                }
            })
            .catch((error) => {
                if (__DEV__) {
                    /* eslint-disable no-console */
                    console.log(error);
                    /* eslint-enable no-console */
                }
            });
    }

    getWalletData() {
        this.props.fetchMarketData();
    }

    animateElipses = (chars, index, time = 750) => {
        this.timeout = setTimeout(() => {
            this.setState({ elipsis: chars[index] });
            const next = index === chars.length - 1 ? 0 : index + 1;
            this.animateElipses(chars, next);
        }, time);
    };

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
        const {
            t,
            theme: { body, primary },
            themeName,
        } = this.props;
        const textColor = { color: body.color };

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
                            source={getAnimation('loading', themeName)}
                            style={styles.animationNewSeed}
                            loop
                            autoPlay
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
                        {(this.state.displayNodeChangeOption && (
                            <View>
                                <Text style={[styles.infoText, textColor, { paddingBottom: height / 30 }]}>
                                    {t('takingAWhile')}...
                                </Text>
                                <SingleFooterButton
                                    onButtonPress={this.onChangeNodePress}
                                    buttonStyle={{
                                        wrapper: { backgroundColor: primary.color },
                                        children: { color: primary.body },
                                    }}
                                    buttonText={t('global:changeNode')}
                                />
                            </View>
                        )) ||
                            (this.state.addingAdditionalAccount && (
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
    themeName: state.settings.themeName,
    deepLinkRequestActive: state.wallet.deepLinkRequestActive,
});

const mapDispatchToProps = {
    changeHomeScreenRoute,
    setSetting,
    getAccountInfo,
    getFullAccountInfo,
    fetchMarketData,
    setLoginRoute,
    fetchMoonPayCountries,
    fetchMoonPayCurrencies,
    checkIPAddress,
    refreshCredentialsAndFetchMeta,
};

export default withTranslation(['loading', 'global'])(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(Loading),
);
