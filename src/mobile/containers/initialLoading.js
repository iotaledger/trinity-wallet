import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import {
    StyleSheet,
    View,
    Dimensions,
    Image,
    ImageBackground,
    Text,
    StatusBar,
    BackHandler,
    Platform,
} from 'react-native';
import { getAllItems, deleteFromKeyChain } from 'iota-wallet-shared-modules/libs/cryptography';
import { getCurrentYear } from 'iota-wallet-shared-modules/libs/dateUtils';
import store from 'iota-wallet-shared-modules/store';
import { DetectNavbar } from '../theme/androidSoftKeys';
import ExtraDimensions from 'react-native-extra-dimensions-android';
import locale from 'react-native-locale-detector';
import i18next from 'i18next';

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
        this.timeout = setTimeout(this.onLoaded.bind(this), 2000);
    }

    componentWillUnmount() {}

    handleBackButton() {
        return false;
    }

    detectLocale() {
        var adaptedLocale = locale.substring(0, 2);
        if (adaptedLocale === 'es' && !locale.match(/ES/)) {
            // Catch all non-Spain Spanish
            return 'es_LA';
        }
        if (locale.match(/ES/)) {
            // Spanish (Spain)
            return 'es_ES';
        }
        if (adaptedLocale === 'pt' && !locale.match(/BR/)) {
            // Catch all non-Brazillian Portuguese
            return 'pt_PT';
        }
        if (adaptedLocale === 'sv') {
            // Swedish (Sweden)
            return 'sv_SE';
        }
        if (adaptedLocale === 'zh' && !locale.match(/Hant/)) {
            // Catch all non-Traditional Chinese
            return 'zh_CN';
        }
        if (locale.match(/Hant/)) {
            // Catch all Traditional Chinese
            return 'zh_TW';
        }
        if (locale.match(/nb/)) {
            // Norwegian Bokmal
            return 'no';
        } else {
            return adaptedLocale;
        }
    }

    clearKeychain() {
        getAllItems().then(keys => {
            if (Platform.OS === 'ios') {
                if (!keys[0].length) {
                    return;
                } else {
                    let key = '';
                    for (let i = 0; i < keys[0].length; i++) {
                        key = keys[0][i].key;
                        deleteFromKeyChain(key);
                    }
                }
            }
        });
    }

    onLoaded() {
        const state = store.getState();
        var localeToUse = this.detectLocale();
        i18next.changeLanguage(localeToUse);
        console.log(localeToUse);
        console.log(i18next.language);
        if (!state.account.onboardingComplete) {
            this.clearKeychain();
            this.props.navigator.push({
                screen: 'languageSetup',
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

    render() {
        const currentYear = getCurrentYear();
        return (
            <ImageBackground source={require('iota-wallet-shared-modules/images/bg-blue.png')} style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={styles.logoContainer}>
                    <Image source={require('iota-wallet-shared-modules/images/iota-white.png')} style={styles.logo} />
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
