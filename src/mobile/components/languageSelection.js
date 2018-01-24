import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Image, View, Text, StyleSheet, TouchableOpacity, Dimensions, TouchableWithoutFeedback } from 'react-native';
import i18next from 'i18next';
import { translate } from 'react-i18next';
import { I18N_LOCALE_LABELS, getLocaleFromLabel } from 'iota-wallet-shared-modules/libs/i18n';
import { detectLocale, selectLocale } from '../components/locale';
import Dropdown from './dropdown';
import { MAX_SEED_LENGTH } from 'iota-wallet-shared-modules/libs/util';

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
        flex: 9,
        justifyContent: 'flex-start',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: height / 50,
        justifyContent: 'flex-start',
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: height / 50,
        justifyContent: 'flex-end',
    },
    iconLeft: {
        width: width / 28,
        height: width / 28,
        marginRight: width / 20,
    },
    titleTextLeft: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
    },
    iconRight: {
        width: width / 28,
        height: width / 28,
    },
    titleTextRight: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        marginRight: width / 20,
    },
    dropdownWidth: {
        width: width / 1.5,
    },
});

const currentLocale = i18next.language;
const currentLanguageLabel = selectLocale(currentLocale);

class LanguageSelection extends Component {
    static propTypes = {
        backPress: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
        setLanguage: PropTypes.func.isRequired,
    };

    constructor() {
        super();

        this.languageSelected = currentLanguageLabel;
    }

    saveLanguageSelection() {
        const { backPress, setLanguage } = this.props;
        const nextLanguage = this.languageSelected;
        setLanguage(nextLanguage);
        i18next.changeLanguage(getLocaleFromLabel(nextLanguage));
        backPress();
    }

    render() {
        const {
            backPress,
            t,
            textColor,
            secondaryBackgroundColor,
            arrowLeftImagePath,
            tickImagePath,
            language,
        } = this.props;

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
                        <Dropdown
                            onRef={(c) => {
                                this.dropdown = c;
                            }}
                            title={t('language')}
                            dropdownWidth={styles.dropdownWidth}
                            defaultOption={language}
                            options={I18N_LOCALE_LABELS}
                            saveSelection={(language) => {
                                this.languageSelected = language;
                            }}
                            background
                        />
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity
                            onPress={() => backPress()}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemLeft}>
                                <Image source={arrowLeftImagePath} style={styles.iconLeft} />
                                <Text style={[styles.titleTextLeft, textColor]}>{t('global:backLowercase')}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.saveLanguageSelection()}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemRight}>
                                <Text style={[styles.titleTextRight, textColor]}>{t('global:save')}</Text>
                                <Image source={tickImagePath} style={styles.iconRight} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default translate(['languageSetup', 'global'])(LanguageSelection);
