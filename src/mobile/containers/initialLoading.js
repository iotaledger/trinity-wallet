import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Dimensions, Image, ImageBackground, Text, StatusBar } from 'react-native';
import { getCurrentYear } from '../../shared/libs/util';
import store from '../../shared/store';

const { height, width } = Dimensions.get('window');

/* eslint-disable global-require */
/* eslint-disable react/jsx-filename-extension */
export default class InitialLoading extends Component {
    componentDidMount() {
        this.timeout = setTimeout(this.onLoaded.bind(this), 100);
    }

    onLoaded() {
        const state = store.getState();
        if (!state.account.onboardingComplete) {
            this.props.navigator.push({
                screen: 'home',
                navigatorStyle: { navBarHidden: true },
                animated: false,
            });
        } else {
            this.props.navigator.push({
                screen: 'home',
                navigatorStyle: { navBarHidden: true },
                animated: false,
            });
        }
    }

    render() {
        const currentYear = getCurrentYear();
        return (
            <ImageBackground source={require('../../shared/images/bg-green.png')} style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={styles.logoContainer}>
                    <Image source={require('../../shared/images/iota-white.png')} style={styles.logo} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.text}>IOTA Foundation © {currentYear}</Text>
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
