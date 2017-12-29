import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
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
import arrowLeftImagePath from 'iota-wallet-shared-modules/images/arrow-left.png';
import tickImagePath from 'iota-wallet-shared-modules/images/tick.png';

class AdvancedThemeCustomisation extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            backgroundColor: props.backgroundColor,
            barColor: props.barColor,
        };
    }

    onApplyPress() {
        //this.props.updateColors(this.state.backgroundColor, this.state.barColor);
    }

    render() {
        const backgroundTextColor = tinycolor(this.state.backgroundColor).isDark() ? '#FAFAFA' : '#222';
        const barTextColor = tinycolor(this.state.barColor).isDark() ? '#FAFAFA' : '#222';
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
                            <Text style={[styles.colorString, { color: backgroundTextColor }]}>Background</Text>
                        </View>
                        <HueSlider
                            style={styles.sliderRow}
                            gradientSteps={40}
                            value={this.state.backgroundColor.h}
                            onValueChange={h =>
                                this.setState({ backgroundColor: { ...this.state.backgroundColor, h } })}
                        />
                        <SaturationSlider
                            style={styles.sliderRow}
                            gradientSteps={20}
                            value={this.state.backgroundColor.s}
                            color={this.state.backgroundColor}
                            onValueChange={s =>
                                this.setState({ backgroundColor: { ...this.state.backgroundColor, s } })}
                        />
                        <LightnessSlider
                            style={styles.sliderRow}
                            gradientSteps={20}
                            value={this.state.backgroundColor.l}
                            color={this.state.backgroundColor}
                            onValueChange={l =>
                                this.setState({ backgroundColor: { ...this.state.backgroundColor, l } })}
                        />
                    </View>
                    <View style={styles.content}>
                        <View
                            style={[
                                styles.colorPreview,
                                { backgroundColor: tinycolor(this.state.barColor).toHslString() },
                            ]}
                        >
                            <Text style={[styles.colorString, { color: barTextColor }]}>Frame</Text>
                        </View>
                        <HueSlider
                            style={styles.sliderRow}
                            gradientSteps={40}
                            value={this.state.barColor.h}
                            onValueChange={h => this.setState({ barColor: { ...this.state.barColor, h } })}
                        />
                        <SaturationSlider
                            style={styles.sliderRow}
                            gradientSteps={20}
                            value={this.state.barColor.s}
                            color={this.state.barColor}
                            onValueChange={s => this.setState({ barColor: { ...this.state.barColor, s } })}
                        />
                        <LightnessSlider
                            style={styles.sliderRow}
                            gradientSteps={20}
                            value={this.state.barColor.l}
                            color={this.state.barColor}
                            onValueChange={l => this.setState({ barColor: { ...this.state.barColor, l } })}
                        />
                    </View>
                </View>
                <View style={styles.bottomContainer}>
                    <TouchableOpacity onPress={() => this.props.backPress()}>
                        <View style={styles.itemLeft}>
                            <Image source={arrowLeftImagePath} style={styles.icon} />
                            <Text style={styles.titleText}>Back</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.onApplyPress()}>
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
        justifyContent: 'center',
        width: width,
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
        fontSize: 34,
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
});

export default AdvancedThemeCustomisation;
