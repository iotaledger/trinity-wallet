import cloneDeep from 'lodash/cloneDeep';
import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { HueSlider, SaturationSlider, LightnessSlider } from 'react-native-color';
import tinycolor from 'tinycolor2';
import { translate } from 'react-i18next';
import { width, height } from '../util/dimensions';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: width / 1.2,
    },
    colorPreview: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 3,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        shadowOpacity: 0.25,
        width: width / 1.2,
        paddingVertical: height / 80,
        marginBottom: height / 100,
    },
    sliderRow: {
        alignSelf: 'stretch',
    },
    colorString: {
        fontSize: width / 20.7,
        fontFamily: 'Lato-Regular',
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
        justifyContent: 'flex-start',
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
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
});

class AdvancedThemeCustomisation extends React.Component {
    static propTypes = {
        backgroundColor: PropTypes.string.isRequired,
        theme: PropTypes.object.isRequired,
        updateTheme: PropTypes.func.isRequired,
        backPress: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
        tickImagePath: PropTypes.number.isRequired,
        arrowLeftImagePath: PropTypes.number.isRequired,
        barBg: PropTypes.string.isRequired,
        textColor: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            backgroundColor: props.backgroundColor,
            barBg: props.barBg,
        };
    }

    onApplyPress() {
        const { backgroundColor, barBg } = this.state;
        const theme = cloneDeep(this.props.theme);
        theme.backgroundColor = backgroundColor;
        theme.barBg = barBg;
        theme.bodyColor = tinycolor(backgroundColor).isDark() ? 'white' : '#222';
        theme.barColor = tinycolor(barBg).isDark() ? 'white' : '#222';
        this.props.updateTheme(theme, 'Custom');
        this.props.backPress();
    }

    render() {
        const { t, tickImagePath, arrowLeftImagePath, textColor } = this.props;
        const backgroundTextColor = tinycolor(this.state.backgroundColor).isDark() ? '#FAFAFA' : '#222';
        const barTextColor = tinycolor(this.state.barBg).isDark() ? '#FAFAFA' : '#222';
        return (
            <View style={styles.container}>
                <View style={styles.topContainer}>
                    <View style={styles.content}>
                        <View
                            style={[
                                styles.colorPreview,
                                { backgroundColor: tinycolor(this.state.backgroundColor).toHslString() },
                            ]}
                        >
                            <Text style={[styles.colorString, { color: backgroundTextColor }]}>{t('background')}</Text>
                        </View>
                        <HueSlider
                            style={styles.sliderRow}
                            gradientSteps={40}
                            value={this.state.backgroundColor.h}
                            onValueChange={(h) =>
                                this.setState({ backgroundColor: { ...this.state.backgroundColor, h } })
                            }
                        />
                        <SaturationSlider
                            style={styles.sliderRow}
                            gradientSteps={20}
                            value={this.state.backgroundColor.s}
                            color={this.state.backgroundColor}
                            onValueChange={(s) =>
                                this.setState({ backgroundColor: { ...this.state.backgroundColor, s } })
                            }
                        />
                        <LightnessSlider
                            style={styles.sliderRow}
                            gradientSteps={20}
                            value={this.state.backgroundColor.l}
                            color={this.state.backgroundColor}
                            onValueChange={(l) =>
                                this.setState({ backgroundColor: { ...this.state.backgroundColor, l } })
                            }
                        />
                    </View>
                    <View style={styles.content}>
                        <View
                            style={[
                                styles.colorPreview,
                                { backgroundColor: tinycolor(this.state.barBg).toHslString() },
                            ]}
                        >
                            <Text style={[styles.colorString, { color: barTextColor }]}>{t('frame')}</Text>
                        </View>
                        <HueSlider
                            style={styles.sliderRow}
                            gradientSteps={40}
                            value={this.state.barBg.h}
                            onValueChange={(h) => this.setState({ barBg: { ...this.state.barBg, h } })}
                        />
                        <SaturationSlider
                            style={styles.sliderRow}
                            gradientSteps={20}
                            value={this.state.barBg.s}
                            color={this.state.barBg}
                            onValueChange={(s) => this.setState({ barBg: { ...this.state.barBg, s } })}
                        />
                        <LightnessSlider
                            style={styles.sliderRow}
                            gradientSteps={20}
                            value={this.state.barBg.l}
                            color={this.state.barBg}
                            onValueChange={(l) => this.setState({ barBg: { ...this.state.barBg, l } })}
                        />
                    </View>
                </View>
                <View style={styles.bottomContainer}>
                    <TouchableOpacity
                        onPress={() => this.props.backPress()}
                        hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                    >
                        <View style={styles.itemLeft}>
                            <Image source={arrowLeftImagePath} style={styles.iconLeft} />
                            <Text style={[styles.titleTextLeft, textColor]}>{t('global:backLowercase')}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => this.onApplyPress()}
                        hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                    >
                        <View style={styles.itemRight}>
                            <Text style={[styles.titleTextRight, textColor]}>{t('global:apply')}</Text>
                            <Image source={tickImagePath} style={styles.iconRight} />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

export default translate(['advancedThemeCustomisation', 'global'])(AdvancedThemeCustomisation);
