import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, TouchableWithoutFeedback } from 'react-native';
import i18next from 'i18next';
import { translate } from 'react-i18next';
import { setSetting } from 'iota-wallet-shared-modules/actions/wallet';
import { setLanguage } from 'iota-wallet-shared-modules/actions/settings';
import { I18N_LOCALE_LABELS, getLocaleFromLabel } from 'iota-wallet-shared-modules/libs/i18n';
import { selectLocale } from 'iota-wallet-shared-modules/libs/locale';
import DropdownComponent from '../containers/Dropdown';
import { Icon } from '../theme/icons.js';
import GENERAL from '../theme/general';

const { width } = Dimensions.get('window');
const { height } = global;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bottomContainer: {
        flex: 1,
        width,
        paddingHorizontal: width / 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    topContainer: {
        flex: 11,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    titleTextLeft: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    titleTextRight: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
        marginRight: width / 20,
    },
});

const currentLocale = i18next.language;
const currentLanguageLabel = selectLocale(currentLocale);

/** Language Selection component */
class LanguageSelection extends Component {
    static propTypes = {
        /** Set new setting
         * @param {string} setting
         */
        setSetting: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Set language
         * @param {string} language - newly selected language
         */
        setLanguage: PropTypes.func.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Selected language */
        language: PropTypes.string.isRequired,
    };

    constructor() {
        super();

        this.languageSelected = currentLanguageLabel;
    }

    saveLanguageSelection() {
        const nextLanguage = this.languageSelected;

        this.props.setLanguage(nextLanguage);

        i18next.changeLanguage(getLocaleFromLabel(nextLanguage));

        this.props.setSetting('mainSettings');
    }

    render() {
        const { t, language, theme } = this.props;

        const textColor = { color: theme.body.color };
        const bodyColor = theme.body.color;

        return (
            <TouchableWithoutFeedback
                onPress={() => {
                    if (this.dropdown) {
                        this.dropdown.closeDropdown();
                    }
                }}
            >
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={{ flex: 0.4 }} />
                        <DropdownComponent
                            onRef={(c) => {
                                this.dropdown = c;
                            }}
                            title={t('language')}
                            dropdownWidth={{ width: width / 1.5 }}
                            defaultOption={language}
                            options={I18N_LOCALE_LABELS}
                            saveSelection={(lang) => {
                                this.languageSelected = lang;
                            }}
                            background
                        />
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.setSetting('mainSettings')}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemLeft}>
                                <Icon name="chevronLeft" size={width / 28} color={bodyColor} />
                                <Text style={[styles.titleTextLeft, textColor]}>{t('global:backLowercase')}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.saveLanguageSelection()}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemRight}>
                                <Text style={[styles.titleTextRight, textColor]}>{t('global:save')}</Text>
                                <Icon name="tick" size={width / 28} color={bodyColor} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    language: state.settings.language,
    theme: state.settings.theme,
});

const mapDispatchToProps = {
    setLanguage,
    setSetting,
};

export default translate(['languageSetup', 'global'])(connect(mapStateToProps, mapDispatchToProps)(LanguageSelection));
