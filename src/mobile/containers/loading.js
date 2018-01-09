import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, ActivityIndicator, Animated } from 'react-native';
import DynamicStatusBar from '../components/dynamicStatusBar';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import {
    getAccountInfo,
    getFullAccountInfo,
    fetchFullAccountInfoForFirstUse,
} from 'iota-wallet-shared-modules/actions/account';
import { setSetting } from 'iota-wallet-shared-modules/actions/tempAccount';
import { changeHomeScreenRoute } from 'iota-wallet-shared-modules/actions/home';
import { getSelectedAccountNameViaSeedIndex } from 'iota-wallet-shared-modules/selectors/account';
import keychain, { getSeed, storeSeedInKeychain } from '../util/keychain';
import { Navigation } from 'react-native-navigation';
import IotaSpin from '../components/iotaSpin';
import THEMES from '../theme/themes';
import KeepAwake from 'react-native-keep-awake';
import LottieView from 'lottie-react-native';
import { width, height } from '../util/dimensions';
class Loading extends Component {
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

        if (!firstUse && !addingAdditionalAccount) {
            this.animation.play();
        }

        KeepAwake.activate();

        this.props.changeHomeScreenRoute('balance');
        this.props.setSetting('mainSettings');

        keychain
            .get()
            .then(credentials => {
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
            .catch(err => console.log(err)); // Dropdown
    }

    componentWillReceiveProps(newProps) {
        const ready = !this.props.ready && newProps.ready;

        if (ready) {
            KeepAwake.deactivate();
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
    }

    render() {
        const {
            firstUse,
            t,
            addingAdditionalAccount,
            negativeColor,
            backgroundColor,
            secondaryBackgroundColor,
        } = this.props;
        const textColor = { color: secondaryBackgroundColor };

        if (firstUse || addingAdditionalAccount) {
            return (
                <View style={[styles.container, { backgroundColor: THEMES.getHSL(backgroundColor) }]}>
                    <DynamicStatusBar textColor={secondaryBackgroundColor} />
                    <View style={styles.animationContainer}>
                        <View>
                            <LottieView
                                ref={animation => {
                                    this.animation = animation;
                                }}
                                source={require('iota-wallet-shared-modules/animations/loading.json')}
                                style={styles.animationNewSeed}
                                loop={true}
                            />
                        </View>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.container}>
                <DynamicStatusBar textColor={secondaryBackgroundColor} />
                <View style={styles.animationContainer}>
                    <View>
                        <LottieView
                            ref={animation => {
                                this.animation = animation;
                            }}
                            source={require('../animations/welcome.json')}
                            style={styles.animationLoading}
                            loop={true}
                        />
                    </View>
                </View>
            </View>
        );
    }
}

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
        paddingTop: height / 30,
        textAlign: 'center',
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
        width,
        height: width,
    },
    animationContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

const mapStateToProps = state => ({
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
});

const mapDispatchToProps = {
    changeHomeScreenRoute,
    setSetting,
    getAccountInfo,
    getFullAccountInfo,
    fetchFullAccountInfoForFirstUse,
};

Loading.propTypes = {
    firstUse: PropTypes.bool.isRequired,
    addingAdditionalAccount: PropTypes.bool.isRequired,
    navigator: PropTypes.object.isRequired,
    getAccountInfo: PropTypes.func.isRequired,
    getFullAccountInfo: PropTypes.func.isRequired,
    fetchFullAccountInfoForFirstUse: PropTypes.func.isRequired,
    selectedAccountName: PropTypes.string.isRequired,
    backgroundColor: PropTypes.object.isRequired,
    negativeColor: PropTypes.object.isRequired,
};

export default translate('loading')(connect(mapStateToProps, mapDispatchToProps)(Loading));
