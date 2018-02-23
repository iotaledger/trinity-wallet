import cloneDeep from 'lodash/cloneDeep';
import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View, TouchableOpacity, TouchableWithoutFeedback, Image } from 'react-native';
import blackChevronDownImagePath from 'iota-wallet-shared-modules/images/chevron-down-black.png';
import whiteChevronDownImagePath from 'iota-wallet-shared-modules/images/chevron-down-white.png';
import Dropdown from './dropdown'; // eslint-disable-line import/no-named-as-default
import { width, height } from '../util/dimensions';
import GENERAL from '../theme/general';
import THEMES from '../theme/themes';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        width,
    },
    themeSelectorContainer: {
        width: width / 1.3,
        height: height / 13,
        alignItems: 'center',
        justifyContent: 'flex-start',
        zIndex: 2,
    },
    themeSelector: {
        justifyContent: 'flex-start',
        zIndex: 2,
    },
    demoContainer: {
        paddingTop: height / 44,
        paddingHorizontal: height / 26,
        paddingBottom: height / 26,
        borderRadius: GENERAL.borderRadius,
        borderWidth: 1.5,
        borderStyle: 'dotted',
        alignItems: 'center',
        marginTop: height / 30,
        position: 'absolute',
        top: height / 8.5,
        zIndex: 1,
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
        alignItems: 'center',
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
    advancedButton: {
        borderWidth: 1.5,
        borderRadius: GENERAL.borderRadius,
        width: width / 2.7,
        height: height / 15,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        position: 'absolute',
        bottom: height / 80,
        zIndex: 3,
    },
    advancedText: {
        fontFamily: 'Lato-Bold',
        fontSize: width / 34.5,
        backgroundColor: 'transparent',
    },
    frameBar: {
        width: width / 1.5,
        height: height / 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.98,
        zIndex: 1,
    },
    frameBarTitle: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 24.4,
        color: '#ffffff',
        zIndex: 1,
    },
    chevronWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    chevron: {
        height: width / 20,
        width: width / 20,
        position: 'absolute',
        right: width / 30,
    },
    buttonsContainer: {
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        marginTop: height / 35,
        width: width / 1.5,
    },
    button: {
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
        width: width / 3.4,
        height: height / 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 25.9,
        backgroundColor: 'transparent',
    },
    ctaButton: {
        borderRadius: GENERAL.borderRadius,
        width: width / 3.4,
        height: height / 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.2,
    },
    ctaText: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 29.6,
        backgroundColor: 'transparent',
    },
});

class ThemeCustomisation extends Component {
    static propTypes = {
        updateTheme: PropTypes.func.isRequired,
        onAdvancedPress: PropTypes.func.isRequired,
        arrowLeftImagePath: PropTypes.number.isRequired,
        tickImagePath: PropTypes.number.isRequired,
        theme: PropTypes.object.isRequired,
        themeName: PropTypes.string.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        backPress: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            theme: props.theme,
            themeName: props.themeName,
            themes: Object.keys(THEMES.themes),
        };
    }

    onApplyPress(theme, themeName) {
        const newTheme = cloneDeep(theme);
        const newThemeName = cloneDeep(themeName);
        this.props.updateTheme(newTheme, newThemeName);
    }

    onAdvancedPress() {
        this.props.onAdvancedPress();
    }

    render() {
        const { themes, theme, themeName } = this.state;
        const {
            backgroundColor,
            ctaColor,
            positiveColor,
            negativeColor,
            extraColor,
            secondaryBackgroundColor,
            secondaryCtaColor,
            ctaBorderColor,
            barColor,
            secondaryBarColor,
        } = this.state.theme;
        const { arrowLeftImagePath, tickImagePath, t } = this.props;
        const chevronDownImagePath =
            secondaryBarColor === 'white' ? whiteChevronDownImagePath : blackChevronDownImagePath;

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
                        <View style={{ zIndex: 2 }}>
                            <Dropdown
                                onRef={(c) => {
                                    this.dropdown = c;
                                }}
                                title={t('theme')}
                                dropdownWidth={{ width: width / 1.45 }}
                                background
                                shadow
                                defaultOption={themeName}
                                options={themes}
                                saveSelection={(selection) => {
                                    const newTHEMES = cloneDeep(THEMES);
                                    let newTheme = newTHEMES.themes[selection];
                                    if (selection === 'Custom' && this.props.themeName === 'Custom') {
                                        newTheme = this.props.theme;
                                    }
                                    this.setState({ themeName: selection, theme: newTheme });
                                }}
                            />
                        </View>
                        <View
                            style={[
                                styles.demoContainer,
                                {
                                    backgroundColor,
                                    borderColor: secondaryBackgroundColor,
                                },
                            ]}
                        >
                            <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: height / 44 }}>
                                <Text
                                    style={{
                                        fontFamily: 'Lato-Regular',
                                        fontSize: width / 29.6,
                                        color: secondaryBackgroundColor,
                                    }}
                                >
                                    MOCKUP
                                </Text>
                            </View>
                            <View style={[styles.frameBar, { backgroundColor: barColor }]}>
                                <Text style={[styles.frameBarTitle, { color: secondaryBarColor }]}>
                                    {t('global:mainWallet').toUpperCase()}
                                </Text>
                                <Image style={styles.chevron} source={chevronDownImagePath} />
                            </View>
                            <View style={styles.buttonsContainer}>
                                <View style={[styles.button, { borderColor: negativeColor }]}>
                                    <Text style={[styles.buttonText, { color: negativeColor }]}>
                                        {t('global:back').toUpperCase()}
                                    </Text>
                                </View>
                                <View style={[styles.button, { borderColor: positiveColor }]}>
                                    <Text style={[styles.buttonText, { color: positiveColor }]}>
                                        {t('global:next').toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.buttonsContainer}>
                                <View style={[styles.button, { borderColor: extraColor }]}>
                                    <Text style={[styles.buttonText, { color: extraColor }]}>
                                        {t('global:save').toUpperCase()}
                                    </Text>
                                </View>
                                <View
                                    style={[
                                        styles.ctaButton,
                                        { backgroundColor: ctaColor, borderColor: ctaBorderColor },
                                    ]}
                                >
                                    <Text style={[styles.ctaText, { color: secondaryCtaColor }]}>
                                        {t('global:send').toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.backPress()}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemLeft}>
                                <Image source={arrowLeftImagePath} style={styles.iconLeft} />
                                <Text style={[styles.titleTextLeft, { color: this.props.secondaryBackgroundColor }]}>
                                    {t('global:backLowercase')}
                                </Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.onApplyPress(theme, themeName)}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemRight}>
                                <Text style={[styles.titleTextRight, { color: this.props.secondaryBackgroundColor }]}>
                                    {t('global:apply')}
                                </Text>
                                <Image source={tickImagePath} style={styles.iconRight} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default translate(['themeCustomisation', 'global'])(ThemeCustomisation);
