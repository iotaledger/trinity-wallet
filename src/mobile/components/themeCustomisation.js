import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TouchableWithoutFeedback, Image } from 'react-native';
import {
    SlidersColorPicker,
    HueGradient,
    SaturationGradient,
    LightnessGradient,
    HueSlider,
    SaturationSlider,
    LightnessSlider,
} from 'react-native-color';
import tinycolor from 'tinycolor2';
import { width, height } from '../util/dimensions';
import Dropdown from '../components/dropdown';
import arrowLeftImagePath from 'iota-wallet-shared-modules/images/arrow-left.png';
import tickImagePath from 'iota-wallet-shared-modules/images/tick.png';
import chevronDownImagePath from 'iota-wallet-shared-modules/images/chevron-down.png';
import GENERAL from '../theme/general';
import THEMES from '../theme/themes';
import Triangle from 'react-native-triangle';

class ThemeCustomisation extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            theme: props.theme,
            themeName: props.themeName,
            themes: Object.keys(THEMES.themes),
        };
    }

    onApplyPress(theme, themeName) {
        this.props.updateTheme(theme, themeName);
    }

    render() {
        const { themes, theme, themeName } = this.state;
        const { backgroundColor, barColor, ctaColor, positiveColor, negativeColor, extraColor } = this.state.theme;
        return (
            <View style={styles.container}>
                <View style={styles.topContainer}>
                    {/*}<View style={styles.swatchesContainer}>
                    {swatches.map((swatch, index) => (
                      <View
                        key={index}
                        style={[
                          styles.swatch,
                          {
                            borderColor: tinycolor(swatch).isDark() ? 'white' : 'black',
                            backgroundColor: tinycolor(swatch).toHslString(),
                            marginRight: index < swatches.length - 1 ? width / 30 : 0
                          }
                        ]}
                      />
                ))}
                </View>
                <Dropdown
                    ref={c => {
                        this.dropdown = c;
                    }}
                    title='Theme'
                    dropdownWidth={styles.dropdownWidth}
                    dropdownHeight={styles.dropdownWidth}
                    defaultOption={currentTheme}
                    options={themes}
                    saveSelection={language => {
                        this.languageSelected = language;
                    }}
                />
                <TouchableOpacity onPress={() => this.props.onAdvancedPress()} style={styles.advancedButton}>
                    <Text style={styles.advancedText}>ADVANCED</Text>
                </TouchableOpacity>*/}
                    <View style={{ zIndex: 2 }}>
                        <Dropdown
                            ref={c => {
                                this.dropdown = c;
                            }}
                            title="Theme"
                            dropdownWidth={{ width: width / 1.5 }}
                            background
                            shadow
                            defaultOption={themeName}
                            options={themes}
                            saveSelection={t => {
                                this.setState({ themeName: t, theme: THEMES.themes[t] });
                            }}
                        />
                    </View>
                    <View
                        style={[
                            styles.demoContainer,
                            { backgroundColor: THEMES.getHSL(backgroundColor), shadowColor: THEMES.getHSL(barColor) },
                        ]}
                    >
                        <View
                            style={[
                                styles.frameBar,
                                { backgroundColor: THEMES.getHSL(barColor), shadowColor: THEMES.getHSL(barColor) },
                            ]}
                        >
                            <Text style={styles.frameBarTitle}>Frame Bar</Text>
                            <Image style={styles.chevron} source={chevronDownImagePath} />
                        </View>
                        {/*<View style={styles.dropdownContainer}>
                        <Text style={styles.dropdownTitle}>Label Text</Text>
                        <View style={styles.dropdownButtonContainer}>
                            <View style={styles.dropdownButton}>
                                <Text numberOfLines={1} style={styles.dropdownSelected}>
                                    FIELD TEXT
                                </Text>
                                <Triangle
                                    width={10}
                                    height={10}
                                    color={'white'}
                                    direction='down'
                                    style={{ marginBottom: height / 80 }}
                                />
                            </View>
                        </View>
                    </View>*/}
                        <View style={styles.buttonsContainer}>
                            <View style={[styles.negativeButton, { borderColor: THEMES.getHSL(negativeColor) }]}>
                                <Text style={[styles.negativeText, { color: THEMES.getHSL(negativeColor) }]}>
                                    NEGATIVE
                                </Text>
                            </View>
                            <View style={[styles.positiveButton, { borderColor: THEMES.getHSL(positiveColor) }]}>
                                <Text style={[styles.positiveText, { color: THEMES.getHSL(positiveColor) }]}>
                                    POSITIVE
                                </Text>
                            </View>
                        </View>
                        <View style={styles.buttonsContainer}>
                            <View style={[styles.extraButton, { borderColor: THEMES.getHSL(extraColor) }]}>
                                <Text style={[styles.extraText, { color: THEMES.getHSL(extraColor) }]}>EXTRA</Text>
                            </View>
                            <View style={[styles.ctaButton, { backgroundColor: THEMES.getHSL(ctaColor) }]}>
                                <Text style={styles.ctaText}>CTA</Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => this.props.onAdvancedPress()} style={styles.advancedButton}>
                        <Text style={styles.advancedText}>ADVANCED</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.bottomContainer}>
                    <TouchableOpacity onPress={() => this.props.backPress()}>
                        <View style={styles.itemLeft}>
                            <Image source={arrowLeftImagePath} style={styles.icon} />
                            <Text style={styles.titleText}>Back</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.onApplyPress(theme, themeName)}>
                        <View style={styles.itemRight}>
                            <Image source={tickImagePath} style={styles.icon} />
                            <Text style={styles.titleText}>Apply</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: width,
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
        padding: height / 26,
        borderRadius: GENERAL.borderRadius,
        borderWidth: 1.5,
        borderStyle: 'dotted',
        borderColor: 'white',
        alignItems: 'center',
        marginTop: height / 30,
        position: 'absolute',
        top: height / 13.5,
        zIndex: 1,
        shadowOffset: {
            width: 0,
            height: -1,
        },
        shadowRadius: 4,
        shadowOpacity: 1.0,
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
    advancedButton: {
        borderColor: 'rgba(255, 255, 255, 0.6)',
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
        color: 'white',
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
        shadowOffset: {
            width: 0,
            height: -1,
        },
        shadowRadius: 4,
        shadowOpacity: 1.0,
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
    dropdownContainer: {
        justifyContent: 'flex-start',
        marginTop: height / 40,
    },
    dropdownTitle: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 33,
        backgroundColor: 'transparent',
    },
    dropdownButtonContainer: {
        marginTop: height / 200,
    },
    dropdownSelected: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        paddingBottom: height / 150,
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        borderBottomColor: 'white',
        borderBottomWidth: 0.7,
        width: width / 1.5,
        height: height / 25,
    },
    buttonsContainer: {
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        marginTop: height / 35,
        width: width / 1.5,
    },
    negativeButton: {
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
        width: width / 3.4,
        height: height / 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    negativeText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
    positiveButton: {
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
        width: width / 3.4,
        height: height / 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    positiveText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
    extraButton: {
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
        width: width / 3.4,
        height: height / 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    extraText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
    ctaButton: {
        borderColor: 'white',
        borderWidth: 1.5,
        borderRadius: GENERAL.borderRadius,
        width: width / 3.4,
        height: height / 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaText: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
});

export default ThemeCustomisation;
