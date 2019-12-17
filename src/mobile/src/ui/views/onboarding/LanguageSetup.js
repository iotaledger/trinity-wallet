import React, { Component } from 'react';
import { StyleSheet, View, TouchableWithoutFeedback } from 'react-native';
import PropTypes from 'prop-types';
import timer from 'react-native-timer';
import { withTranslation } from 'react-i18next';
import navigator from 'libs/navigation';
import SplashScreen from 'react-native-splash-screen';
import { getDeviceLocale } from 'react-native-device-info';
import LottieView from 'lottie-react-native';
import { I18N_LOCALE_LABELS, getLabelFromLocale, getLocaleFromLabel, detectLocale } from 'shared-modules/libs/i18n';
import { setLanguage, setLocale } from 'shared-modules/actions/settings';
import { getAnimation } from 'shared-modules/animations';
import { connect } from 'react-redux';
import { setSetting } from 'shared-modules/actions/wallet';
import { getThemeFromState } from 'shared-modules/selectors/global';
import i18next from 'shared-modules/libs/i18next';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import { width } from 'libs/dimensions';
import { isAndroid, isIOS } from 'libs/device';
import DropdownComponent from 'ui/components/Dropdown';
import SingleFooterButton from 'ui/components/SingleFooterButton';
import Header from 'ui/components/Header';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 1.8,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    midContainer: {
        flex: 3.5,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bottomContainer: {
        flex: 1.3,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    animation: {
        width: width / 1.35,
        height: width / 1.35,
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
        forceUpdate: PropTypes.bool.isRequired,
        /** @ignore */
        themeName: PropTypes.string.isRequired,
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
        navigator.push('welcome');
    }

    selectLanguage(language) {
        i18next.changeLanguage(getLocaleFromLabel(language));
        this.props.setLanguage(language);
        this.props.setLocale(getLocaleFromLabel(language));
    }

    render() {
        const {
            t,
            theme: { body },
            themeName,
        } = this.props;

        return (
            <TouchableWithoutFeedback
                onPress={() => {
                    if (isIOS) {
                        this.dropdown.closeDropdown();
                    }
                }}
                accessible={false}
            >
                <View style={{ flex: 1, backgroundColor: body.bg }}>
                    <View style={styles.container}>
                        <View style={styles.topContainer}>
                            <AnimatedComponent
                                animationInType={['fadeIn']}
                                animationOutType={['fadeOut', 'slideOutLeft']}
                                delay={400}
                            >
                                <Header textColor={body.color}>{t('selectALanguage')}</Header>
                            </AnimatedComponent>
                        </View>
                        <View style={styles.midContainer}>
                            <AnimatedComponent
                                animationInType={['fadeIn']}
                                animationOutType={['fadeOut', 'slideOutLeft']}
                                delay={200}
                                style={styles.animation}
                            >
                                <LottieView
                                    source={getAnimation('language', themeName)}
                                    style={styles.animation}
                                    loop={false}
                                    autoPlay
                                    ref={(ref) => {
                                        this.animation = ref;
                                    }}
                                    onAnimationFinish={() => this.animation.play(52, 431)}
                                />
                            </AnimatedComponent>
                            <View style={{ flex: 0.2 }} />
                            <AnimatedComponent
                                animationInType={['fadeIn']}
                                animationOutType={['fadeOut', 'slideOutLeft']}
                                delay={100}
                            >
                                <DropdownComponent
                                    onRef={(c) => {
                                        this.dropdown = c;
                                    }}
                                    title={t('language')}
                                    value={defaultLanguageLabel}
                                    options={I18N_LOCALE_LABELS}
                                    saveSelection={(language) => this.selectLanguage(language)}
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
    forceUpdate: state.wallet.forceUpdate,
    themeName: state.settings.themeName,
});

const mapDispatchToProps = {
    setSetting,
    setLanguage,
    setLocale,
};

export default withTranslation(['languageSetup', 'global'])(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(LanguageSetup),
);
