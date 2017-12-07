import React, { Component } from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity, Dimensions, TouchableWithoutFeedback } from 'react-native';
import i18next from 'i18next';
import { translate } from 'react-i18next';
import { I18N_LOCALE_LABELS, getLocaleFromLabel } from 'iota-wallet-shared-modules/libs/i18n';
import { detectLocale, selectLocale } from '../components/locale';
import Dropdown from '../components/dropdown';
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
    icon: {
        width: width / 22,
        height: width / 22,
        marginRight: width / 25,
    },
    titleText: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
    },
    dropdownWidth: {
        width: width / 1.5,
    },
});

const currentLocale = i18next.language;
const currentLanguageLabel = selectLocale(currentLocale);

class LanguageSelection extends Component {
    constructor(props) {
        super(props);
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
                            title={this.languageSelected}
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
                                <Image
                                    source={require('iota-wallet-shared-modules/images/arrow-left.png')}
                                    style={styles.icon}
                                />
                                <Text style={styles.titleText}>Back</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.saveLanguageSelection()}>
                            <View style={styles.itemRight}>
                                <Image
                                    source={require('iota-wallet-shared-modules/images/tick.png')}
                                    style={styles.icon}
                                />
                                <Text style={styles.titleText}>Save</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default translate(['languageSelection', 'global'])(LanguageSelection);
