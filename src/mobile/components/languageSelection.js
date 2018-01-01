import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Image, View, Text, StyleSheet, TouchableOpacity, Dimensions, TouchableWithoutFeedback } from 'react-native';
import i18next from 'i18next';
import { translate } from 'react-i18next';
import { I18N_LOCALE_LABELS, getLocaleFromLabel } from 'iota-wallet-shared-modules/libs/i18n';
import { detectLocale, selectLocale } from '../components/locale';
import Dropdown from '../components/dropdown';
import { MAX_SEED_LENGTH } from 'iota-wallet-shared-modules/libs/util';
import arrowLeftImagePath from 'iota-wallet-shared-modules/images/arrow-left.png';
import tickImagePath from 'iota-wallet-shared-modules/images/tick.png';

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
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
    },
    iconRight: {
        width: width / 28,
        height: width / 28,
    },
    titleTextRight: {
        color: 'white',
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
    };

    constructor() {
        super();

        this.languageSelected = currentLanguageLabel;
    }

    saveLanguageSelection() {
        const { backPress } = this.props;
        i18next.changeLanguage(getLocaleFromLabel(this.languageSelected));
        backPress();
    }

    render() {
        const { backPress, t } = this.props;

        return (
            <TouchableWithoutFeedback onPress={() => this.dropdown.closeDropdown()}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={{ flex: 0.2 }} />
                        <Dropdown
                            ref={c => {
                                this.dropdown = c;
                            }}
                            title={this.languageSelected} //TODO: Ask if this is correct
                            dropdownWidth={styles.dropdownWidth}
                            defaultOption={currentLanguageLabel}
                            options={I18N_LOCALE_LABELS}
                            saveSelection={language => {
                                this.languageSelected = language;
                            }}
                        />
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity onPress={() => backPress()}>
                            <View style={styles.itemLeft}>
                                <Image source={arrowLeftImagePath} style={styles.iconLeft} />
                                <Text style={styles.titleTextLeft}>{t('global:back')}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.saveLanguageSelection()}>
                            <View style={styles.itemRight}>
                                <Text style={styles.titleTextRight}>{t('global:save')}</Text>
                                <Image source={tickImagePath} style={styles.iconRight} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default translate(['languageSelection', 'global'])(LanguageSelection);
