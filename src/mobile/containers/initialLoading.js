import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Dimensions, Image, ImageBackground, Text, StatusBar, BackHandler } from 'react-native';
import { getCurrentYear } from '../../shared/libs/dateUtils';
import store from '../../shared/store';
import { DetectNavbar } from '../theme/androidSoftKeys';
import ExtraDimensions from 'react-native-extra-dimensions-android';

const width = Dimensions.get('window').width;
let height = Dimensions.get('window').height;
global.height = DetectNavbar.hasSoftKeys()
    ? (height -= ExtraDimensions.get('SOFT_MENU_BAR_HEIGHT'))
    : Dimensions.get('window').height;

/* eslint-disable global-require */
/* eslint-disable react/jsx-filename-extension */
export default class InitialLoading extends Component {
    constructor() {
        super();

        console.ignoredYellowBox = ['Setting a timer'];
    }

    componentDidMount() {
        this.timeout = setTimeout(this.onLoaded.bind(this), 100);
    }

    componentWillUnmount() {}

    handleBackButton() {
        return false;
    }

    onLoaded() {
        const state = store.getState();
        if (!state.account.onboardingComplete) {
            this.props.navigator.push({
                screen: 'languageSetup',
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
            <ImageBackground source={require('../../shared/images/bg-blue.png')} style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={styles.logoContainer}>
                    <Image source={require('../../shared/images/iota-white.png')} style={styles.logo} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.text}>IOTA Alpha Wallet {currentYear}</Text>
                </View>
            </ImageBackground>
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
