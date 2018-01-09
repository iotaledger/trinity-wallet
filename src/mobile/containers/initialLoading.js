import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { StyleSheet, View, Image, Text, StatusBar } from 'react-native';
import { getVersion, getBuildNumber } from 'react-native-device-info';
import iotaWhiteImagePath from 'iota-wallet-shared-modules/images/iota-white.png';
import LottieView from 'lottie-react-native';

import keychain from '../util/keychain';
import { width, height } from '../util/dimensions';
import { isIOS } from '../util/device';
import THEMES from '../theme/themes';

const version = getVersion();
const build = getBuildNumber();

const FULL_VERSION = `v ${version}  (${build})`;

class InitialLoading extends Component {
    static propTypes = {
        navigator: PropTypes.object.isRequired,
        onboardingComplete: PropTypes.bool.isRequired,
        backgroundColor: PropTypes.object.isRequired,
    };

    constructor() {
        super();

        console.ignoredYellowBox = ['Setting a timer']; // eslint-disable-line no-console
    }

    componentDidMount() {
        this.animation.play();
        this.timeout = setTimeout(this.onLoaded.bind(this), 2000);
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
        const { backgroundColor } = this.props;
        return (
            <View style={[styles.container, { backgroundColor: THEMES.getHSL(backgroundColor) }]}>
                <StatusBar barStyle="light-content" />
                <View style={styles.logoContainer}>
                    <View style={styles.animationContainer}>
                        <LottieView
                            ref={animation => {
                                this.animation = animation;
                            }}
                            source={require('../animations/welcome.json')}
                            style={styles.animation}
                        />
                    </View>
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
    },
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
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
});

export default connect(mapStateToProps, null)(InitialLoading);
