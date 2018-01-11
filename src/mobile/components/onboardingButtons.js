import get from 'lodash/get';
import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import GENERAL from '../theme/general';
import { connect } from 'react-redux';
import THEMES from '../theme/themes';

import { width, height } from '../util/dimensions';

class OnboardingButtons extends Component {
    render() {
        const { style, positiveColor, negativeColor } = this.props;
        const positiveTextColor = { color: THEMES.getHSL(positiveColor) };
        const positiveBorderColor = { borderColor: THEMES.getHSL(positiveColor) };
        const negativeTextColor = { color: THEMES.getHSL(negativeColor) };
        const negativeBorderColor = { borderColor: THEMES.getHSL(negativeColor) };

        return (
            <View style={styles.buttonsContainer}>
                <TouchableOpacity onPress={(event) => this.props.onLeftButtonPress()}>
                    <View style={[styles.leftButton, negativeBorderColor]}>
                        <Text style={[styles.leftText, negativeTextColor]}>{this.props.leftText}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={(event) => this.props.onRightButtonPress()}>
                    <View style={[styles.rightButton, positiveBorderColor]}>
                        <Text style={[styles.rightText, positiveTextColor]}>{this.props.rightText}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    buttonsContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    rightButton: {
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
        width: width / 3,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    rightText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
    leftButton: {
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
        width: width / 3,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginRight: width / 14,
    },
    leftText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
});

const mapStateToProps = (state) => ({
    tempAccount: state.tempAccount,
    positiveColor: state.settings.theme.positiveColor,
    negativeColor: state.settings.theme.negativeColor,
});

export default connect(mapStateToProps)(OnboardingButtons);
