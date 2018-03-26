import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TouchableWithoutFeedback, Image } from 'react-native';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import i18next from 'i18next';
import { getDeviceLocale } from 'react-native-device-info';
import { I18N_LOCALE_LABELS, getLocaleFromLabel } from 'iota-wallet-shared-modules/libs/i18n';
import helloBackImagePath from 'iota-wallet-shared-modules/images/hello-back.png';
import { detectLocale, selectLocale } from 'iota-wallet-shared-modules/libs/locale';
import { connect } from 'react-redux';
import { setSetting } from 'iota-wallet-shared-modules/actions/wallet';
import { setLanguage } from 'iota-wallet-shared-modules/actions/settings';
import WithBackPressCloseApp from '../components/BackPressCloseApp';
import { width, height } from '../utils/dimensions';
import DropdownComponent from '../containers/Dropdown';
import GENERAL from '../theme/general';
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
    nextButton: {
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
        width: width / 3,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: height / 20,
    },
    nextText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
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
        body: PropTypes.object.isRequired,
        primary: PropTypes.object.isRequired,
        setLanguage: PropTypes.func.isRequired,
    };

    static clickDropdownItem(languageLabel) {
        i18next.changeLanguage(getLocaleFromLabel(languageLabel));
    }

    componentWillMount() {
        console.log('In mount');
        i18next.changeLanguage(defaultLocale);
    }

    onNextPress() {
        const { body } = this.props;
        this.props.navigator.push({
            screen: 'welcome',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                screenBackgroundColor: body.bg,
                drawUnderStatusBar: true,
                statusBarColor: body.bg,
            },
            animated: false,
        });
    }

    render() {
        const { t, body, primary } = this.props;
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
                                saveSelection={(language) => LanguageSetup.clickDropdownItem(language)}
                            />
                        </View>
                        <View style={styles.bottomContainer}>
                            <TouchableOpacity onPress={() => this.onNextPress()} testID="languageSetup-next">
                                <View style={[styles.nextButton, { borderColor: primary.color }]}>
                                    <Text style={[styles.nextText, { color: primary.color }]}>{t('global:next')}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    body: state.settings.theme.body,
    primary: state.settings.theme.primary,
});

const mapDispatchToProps = {
    setSetting,
    setLanguage,
};

export default WithBackPressCloseApp()(
    translate(['languageSetup', 'global'])(connect(mapStateToProps, mapDispatchToProps)(LanguageSetup)),
);
