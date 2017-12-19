import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { StyleSheet, View, Image, Text, StatusBar, BackHandler } from 'react-native';
import keychain from '../util/keychain';
import { getCurrentYear } from 'iota-wallet-shared-modules/libs/dateUtils';
import store from 'iota-wallet-shared-modules/store';
import { width, height } from '../util/dimensions';
import { isIOS } from '../util/device';
import { getVersion, getBuildNumber } from 'react-native-device-info';
import COLORS from '../theme/Colors';
import iotaWhiteImagePath from 'iota-wallet-shared-modules/images/iota-white.png';

const version = getVersion();
const build = getBuildNumber();
const FULL_VERSION = 'v' + version + ' (' + build + ')';

/* eslint-disable global-require */
/* eslint-disable react/jsx-filename-extension */
export default class InitialLoading extends Component {
    constructor() {
        super();
        console.ignoredYellowBox = ['Setting a timer'];
    }

    componentDidMount() {
        this.timeout = setTimeout(this.onLoaded.bind(this), 2000);
    }

    componentWillUnmount() {}

    handleBackButton() {
        return false;
    }

    clearKeychain() {
        if (isIOS) {
            keychain.clear().catch(err => console.error(err));
        }
    }

    onLoaded() {
        const state = store.getState();
        if (!state.account.onboardingComplete) {
            this.clearKeychain();
            this.props.navigator.push({
                screen: 'welcome',
                navigatorStyle: { navBarHidden: true, navBarTransparent: true },
                animated: false,
                overrideBackPress: true,
            });
        } else {
            this.props.navigator.push({
                screen: 'home',
                navigatorStyle: { navBarHidden: true, navBarTransparent: true },
                animated: false,
                overrideBackPress: true,
            });
        }
    }

    render() {
        const currentYear = getCurrentYear();
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={styles.logoContainer}>
                    <Image source={iotaWhiteImagePath} style={styles.logo} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.text}>IOTA Alpha Wallet {FULL_VERSION}</Text>
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
        backgroundColor: COLORS.backgroundGreen,
    },
    logoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: height / 15,
    },
    text: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        color: 'white',
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
});

InitialLoading.propTypes = {
    navigator: PropTypes.object.isRequired,
};
