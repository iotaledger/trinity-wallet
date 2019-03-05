import React, { Component } from 'react';
import { StyleSheet, View, TouchableWithoutFeedback, Image } from 'react-native';
import PropTypes from 'prop-types';
import timer from 'react-native-timer';
import { withNamespaces } from 'react-i18next';
import { navigator } from 'libs/navigation';
import SplashScreen from 'react-native-splash-screen';
import { getDeviceLocale } from 'react-native-device-info';
import { I18N_LOCALE_LABELS, getLabelFromLocale, getLocaleFromLabel, detectLocale } from 'shared-modules/libs/i18n';
import { setLanguage, setLocale } from 'shared-modules/actions/settings';
import helloBackImagePath from 'shared-modules/images/hello-back.png';
import { connect } from 'react-redux';
import { setSetting } from 'shared-modules/actions/wallet';
import { getThemeFromState } from 'shared-modules/selectors/global';
import i18next from 'shared-modules/libs/i18next';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import { width, height } from 'libs/dimensions';
import { isAndroid } from 'libs/device';
import DropdownComponent from 'ui/components/Dropdown';
import SingleFooterButton from 'ui/components/SingleFooterButton';
import { Icon } from 'ui/theme/icons';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

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
        width,
        height: width / 0.95,
    },
});

const defaultLocale = detectLocale(getDeviceLocale());
const defaultLanguageLabel = getLabelFromLocale(defaultLocale);

class LanguageSetup extends Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        setLanguage: PropTypes.func.isRequired,
        /** @ignore */
        setLocale: PropTypes.func.isRequired,
        /** @ignore */
        acceptedPrivacy: PropTypes.bool.isRequired,
        /** @ignore */
        acceptedTerms: PropTypes.bool.isRequired,
        /** @ignore */
        forceUpdate: PropTypes.bool.isRequired,
    };

    componentWillMount() {
        i18next.changeLanguage(defaultLocale);
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('LanguageSetup');
        if (!isAndroid) {
            SplashScreen.hide();
        }
    }

    componentWillUnmount() {
        timer.clearTimeout('delayReset');
    }
    onNextPress() {
        const { forceUpdate } = this.props;
        if (forceUpdate) {
            return;
        }
        navigator.push(this.getNextRoute());
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
        const { t, theme: { body } } = this.props;

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
                        <AnimatedComponent
                            animationInType={['fadeIn']}
                            animationOutType={['fadeOut']}
                            delay={0}
                            style={[styles.helloBackground, { position: 'absolute' }]}
                        >
                            <Image style={styles.helloBackground} source={helloBackImagePath} />
                        </AnimatedComponent>
                        <View style={styles.topContainer}>
                            <AnimatedComponent
                                animationInType={['fadeIn']}
                                animationOutType={['fadeOut', 'slideOutLeft']}
                                delay={200}
                            >
                                <Icon name="iota" size={width / 8} color={body.color} />
                            </AnimatedComponent>
                        </View>
                        <View style={styles.midContainer}>
                            <AnimatedComponent
                                style={{ position: 'absolute', height: height / 1.3 }}
                                animationInType={['fadeIn']}
                                animationOutType={['fadeOut', 'slideOutLeft']}
                                delay={100}
                            >
                                <View style={{ flex: 0.5 }} />
                                <DropdownComponent
                                    onRef={(c) => {
                                        this.dropdown = c;
                                    }}
                                    title={t('language')}
                                    value={defaultLanguageLabel}
                                    options={I18N_LOCALE_LABELS}
                                    saveSelection={(language) => this.clickDropdownItem(language)}
                                />
                            </AnimatedComponent>
                        </View>
                        <View style={styles.bottomContainer}>
                            <AnimatedComponent
                                animationInType={['fadeIn']}
                                animationOutType={['fadeOut', 'slideOutLeft']}
                                delay={0}
                            >
                                <SingleFooterButton
                                    onButtonPress={() => this.onNextPress()}
                                    testID="languageSetup-next"
                                    buttonText={t('letsGetStarted')}
                                />
                            </AnimatedComponent>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
    acceptedPrivacy: state.settings.acceptedPrivacy,
    acceptedTerms: state.settings.acceptedTerms,
    forceUpdate: state.wallet.forceUpdate,
});

const mapDispatchToProps = {
    setSetting,
    setLanguage,
    setLocale,
};

export default withNamespaces(['languageSetup', 'global'])(connect(mapStateToProps, mapDispatchToProps)(LanguageSetup));
