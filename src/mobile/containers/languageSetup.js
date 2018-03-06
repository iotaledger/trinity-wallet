import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, StatusBar, TouchableWithoutFeedback } from 'react-native';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import i18next from 'i18next';
import { getDeviceLocale } from 'react-native-device-info';
import { I18N_LOCALE_LABELS, getLocaleFromLabel } from 'iota-wallet-shared-modules/libs/i18n';
import helloBackImagePath from 'iota-wallet-shared-modules/images/hello-back.png';
import iotaGlowImagePath from 'iota-wallet-shared-modules/images/iota-glow.png';
import WithBackPressCloseApp from '../components/withBackPressCloseApp';
import { width, height } from '../util/dimensions';
import DropdownComponent from '../components/dropdown';
import COLORS from '../theme/Colors';
import GENERAL from '../theme/general';
import { detectLocale, selectLocale } from 'iota-wallet-shared-modules/libs/locale';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundGreen,
    },
    topContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
    },
    midContainer: {
        flex: 4,
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
});

const locale = getDeviceLocale();
const defaultLocale = detectLocale(locale);
const defaultLanguageLabel = selectLocale(defaultLocale);

class LanguageSetup extends Component {
    static propTypes = {
        t: PropTypes.func.isRequired,
        navigator: PropTypes.object.isRequired,
    };

    static clickDropdownItem(languageLabel) {
        i18next.changeLanguage(getLocaleFromLabel(languageLabel));
    }

    componentWillMount() {
        i18next.changeLanguage(defaultLocale);
    }

    onNextPress() {
        this.props.navigator.push({
            screen: 'welcome',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                screenBackgroundColor: COLORS.backgroundGreen,
                drawUnderStatusBar: true,
                statusBarColor: COLORS.backgroundGreen,
            },
            animated: false,
        });
    }

    render() {
        const { t } = this.props;
        return (
            <TouchableWithoutFeedback
                onPress={() => {
                    if (this.dropdown) {
                        this.dropdown.closeDropdown();
                    }
                }}
                accessible={false}
            >
                <View style={{ flex: 1, backgroundColor: COLORS.backgroundGreen }}>
                    <View style={styles.container}>
                        <Image style={styles.helloBackground} source={helloBackImagePath} />
                        <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundGreen} />
                        <View style={styles.topContainer}>
                            <Image source={iotaGlowImagePath} style={styles.iotaLogo} />
                        </View>
                        <View style={styles.midContainer}>
                            <View style={{ flex: 0.5 }} />
                            <DropdownComponent
                                onRef={(c) => {
                                    this.dropdown = c;
                                }}
                                title={t('language')}
                                dropdownWidth={{ width: width / 1.5 }}
                                defaultOption={defaultLanguageLabel}
                                options={I18N_LOCALE_LABELS}
                                saveSelection={(language) => LanguageSetup.clickDropdownItem(language)}
                            />
                        </View>
                        <View style={styles.bottomContainer}>
                            <TouchableOpacity onPress={() => this.onNextPress()} testID="languageSetup-next">
                                <View style={styles.nextButton}>
                                    <Text style={styles.nextText}>{t('global:next')}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default WithBackPressCloseApp()(translate(['languageSetup', 'global'])(LanguageSetup));
