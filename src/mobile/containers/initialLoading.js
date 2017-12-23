import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { StyleSheet, View, Image, Text, StatusBar } from 'react-native';
import { getVersion, getBuildNumber } from 'react-native-device-info';
import iotaWhiteImagePath from 'iota-wallet-shared-modules/images/iota-white.png';

import keychain from '../util/keychain';
import { width, height } from '../util/dimensions';
import { isIOS } from '../util/device';
import COLORS from '../theme/Colors';

const version = getVersion();
const build = getBuildNumber();

const FULL_VERSION = `v ${version}  ( ${build} )`;

class InitialLoading extends Component {
    static propTypes = {
        navigator: PropTypes.object.isRequired,
        onboardingComplete: PropTypes.bool.isRequired,
    };

    constructor() {
        super();

        console.ignoredYellowBox = ['Setting a timer']; // eslint-disable-line no-console
    }

    componentDidMount() {
        this.timeout = setTimeout(this.onLoaded.bind(this), 2000);
    }

    onLoaded() {
        if (!this.props.onboardingComplete) {
            this.clearKeychain();
            this.props.navigator.push({
                screen: 'welcome',
                navigatorStyle: { navBarHidden: true, navBarTransparent: true },
                animated: false,
                overrideBackPress: true,
            });
        } else {
            this.props.navigator.push({
                screen: 'login',
                navigatorStyle: { navBarHidden: true, navBarTransparent: true },
                animated: false,
                overrideBackPress: true,
            });
        }
    }

    clearKeychain() {
        if (isIOS) {
            keychain.clear().catch(err => console.error(err)); // eslint-disable-line no-console
        }
    }

    render() {
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

const mapStateToProps = state => ({
    onboardingComplete: state.account.onboardingComplete,
});

export default connect(mapStateToProps, null)(InitialLoading);
