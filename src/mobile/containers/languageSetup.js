import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import i18next from 'i18next';
import { detectLocale, selectLocale } from '../components/locale';
import { getDeviceLocale } from 'react-native-device-info';
import { I18N_LOCALE_LABELS, getLocaleFromLabel } from 'iota-wallet-shared-modules/libs/i18n';
import Dropdown from '../components/dropdown';
import COLORS from '../theme/Colors';
import GENERAL from '../theme/general';

import helloBackImagePath from 'iota-wallet-shared-modules/images/hello-back.png';
import blueBackgroundImagePath from 'iota-wallet-shared-modules/images/bg-blue.png';
import iotaGlowImagePath from 'iota-wallet-shared-modules/images/iota-glow.png';
import { width, height } from '../util/dimensions';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundDarkGreen,
    },
    topContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
    },
    midContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    nextButton: {
        borderColor: '#9DFFAF',
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
        width: width / 3,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: height / 20,
    },
    nextText: {
        color: '#9DFFAF',
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
    helloBackground: {
        position: 'absolute',
        width,
        height: width / 0.95,
    },
    dropdownWidth: {
        width: width / 1.5,
    },
});

const locale = getDeviceLocale();
const defaultLocale = detectLocale(locale);
const defaultLanguageLabel = selectLocale(defaultLocale);

class LanguageSetup extends Component {
    componentWillMount() {
        i18next.changeLanguage(defaultLocale);
    }

    onNextPress() {
        this.props.navigator.push({
            screen: 'welcome',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
            },
            animated: false,
            overrideBackPress: true,
        });
    }

    clickDropdownItem(languageLabel) {
        i18next.changeLanguage(getLocaleFromLabel(languageLabel));
    }

    render() {
        const { t } = this.props;
        return (
            <View style={{ flex: 1, backgroundColor: COLORS.backgroundGreen }}>
                <View style={styles.container}>
                    <Image style={styles.helloBackground} source={helloBackImagePath} />
                    <StatusBar barStyle="light-content" />
                    <View style={styles.topContainer}>
                        <Image source={iotaGlowImagePath} style={styles.iotaLogo} />
                    </View>
                    <View style={styles.midContainer}>
                        <View style={{ flex: 0.2 }} />
                        <Dropdown
                            title={t('language')}
                            dropdownWidth={styles.dropdownWidth}
                            defaultOption={defaultLanguageLabel}
                            options={I18N_LOCALE_LABELS}
                            saveSelection={language => this.clickDropdownItem(language)}
                        />
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity onPress={() => this.onNextPress()}>
                            <View style={styles.nextButton}>
                                <Text style={styles.nextText}>{t('global:next')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
}

const mapStateToProps = state => ({});

export default translate(['languageSetup', 'global'])(connect(mapStateToProps)(LanguageSetup));
