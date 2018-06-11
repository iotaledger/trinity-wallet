import React, { Component } from 'react';
import { StyleSheet, View, TouchableWithoutFeedback, Image } from 'react-native';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import SplashScreen from 'react-native-splash-screen';
import { getDeviceLocale } from 'react-native-device-info';
import { I18N_LOCALE_LABELS, getLocaleFromLabel } from 'iota-wallet-shared-modules/libs/i18n';
import { setLanguage, setLocale } from 'iota-wallet-shared-modules/actions/settings';
import helloBackImagePath from 'iota-wallet-shared-modules/images/hello-back.png';
import { detectLocale, selectLocale } from 'iota-wallet-shared-modules/libs/locale';
import { connect } from 'react-redux';
import { setSetting } from 'iota-wallet-shared-modules/actions/wallet';
import i18next from '../i18next';
import WithBackPressCloseApp from '../components/BackPressCloseApp';
import { width, height } from '../utils/dimensions';
import { isAndroid } from '../utils/device';
import DropdownComponent from '../containers/Dropdown';
import Button from '../components/Button';
import { Icon } from '../theme/icons.js';
import DynamicStatusBar from '../components/DynamicStatusBar';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 16,
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
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Change selected language
         * @param {string} language
         */
        setLanguage: PropTypes.func.isRequired,
        /**
         * Change selected locale
         * @param {string}
         */
        setLocale: PropTypes.func.isRequired,
        /** Determines whether a user has accepted privacy agreement */
        acceptedPrivacy: PropTypes.bool.isRequired,
        /** Determines whether a user has accepted terms and conditions */
        acceptedTerms: PropTypes.bool.isRequired,
    };

    componentWillMount() {
        i18next.changeLanguage(defaultLocale);
    }

    componentDidMount() {
        if (!isAndroid) {
            SplashScreen.hide();
        }
    }

    onNextPress() {
        const { theme: { body, bar }, acceptedTerms, acceptedPrivacy } = this.props;

        this.props.navigator.push({
            screen: this.getNextRoute(),
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                topBarElevationShadowEnabled: false,
                screenBackgroundColor: body.bg,
                drawUnderStatusBar: true,
                statusBarColor: !acceptedTerms || !acceptedPrivacy ? bar.bg : body.bg,
            },
            animated: false,
        });
    }

    getNextRoute() {
        const { acceptedTerms, acceptedPrivacy } = this.props;

        let nextRoute = 'walletSetup';

        if (!acceptedTerms && !acceptedPrivacy) {
            nextRoute = 'termsAndConditions';
        } else if (acceptedTerms && !acceptedPrivacy) {
            nextRoute = 'privacyPolicy';
        }

        return nextRoute;
    }

    clickDropdownItem(language) {
        i18next.changeLanguage(getLocaleFromLabel(language));
        this.props.setLanguage(language);
        this.props.setLocale(getLocaleFromLabel(language));
    }

    render() {
        const { t, theme: { body, primary } } = this.props;

        return (
            <TouchableWithoutFeedback
                onPress={() => {
                    if (this.dropdown) {
                        this.dropdown.closeDropdown();
                    }
                }}
                accessible={false}
            >
                <View style={{ flex: 1, backgroundColor: body.bg }}>
                    <View style={styles.container}>
                        <Image style={styles.helloBackground} source={helloBackImagePath} />
                        <DynamicStatusBar backgroundColor={body.bg} />
                        <View style={styles.topContainer}>
                            <Icon name="iota" size={width / 8} color={body.color} />
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
                                saveSelection={(language) => this.clickDropdownItem(language)}
                            />
                        </View>
                        <View style={styles.bottomContainer}>
                            <Button
                                onPress={() => this.onNextPress()}
                                testID="languageSetup-next"
                                style={{
                                    wrapper: { backgroundColor: primary.color },
                                    children: { color: primary.body },
                                }}
                            >
                                {t('letsGetStarted')}
                            </Button>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
    acceptedPrivacy: state.settings.acceptedPrivacy,
    acceptedTerms: state.settings.acceptedTerms,
});

const mapDispatchToProps = {
    setSetting,
    setLanguage,
    setLocale,
};

export default WithBackPressCloseApp()(
    translate(['languageSetup', 'global'])(connect(mapStateToProps, mapDispatchToProps)(LanguageSetup)),
);
