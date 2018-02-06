import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import GENERAL from '../theme/general';
import { connect } from 'react-redux';
import { width, height } from '../util/dimensions';

const styles = StyleSheet.create({
    buttonsContainer: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        flexDirection: 'row',
        width: width / 1.36,
    },
    button: {
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
        width: width / 3,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    text: {
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
});

class OnboardingButtons extends Component {
    render() {
        const { style, positiveColor, negativeColor, opacity } = this.props;
        const positiveTextColor = { color: positiveColor };
        const positiveBorderColor = { borderColor: positiveColor };
        const negativeTextColor = { color: negativeColor };
        const negativeBorderColor = { borderColor: negativeColor };
        const rightButtonOpacity = { opacity };

        return (
            <View style={styles.buttonsContainer}>
                <TouchableOpacity onPress={() => this.props.onLeftButtonPress()} testID={this.props.leftButtonTestID}>
                    <View style={[styles.button, negativeBorderColor]}>
                        <Text style={[styles.text, negativeTextColor]}>{this.props.leftText}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.props.onRightButtonPress()} testID={this.props.rightButtonTestID}>
                    <View style={[styles.button, positiveBorderColor, rightButtonOpacity]}>
                        <Text style={[styles.text, positiveTextColor]}>{this.props.rightText}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}

const mapStateToProps = state => ({
    tempAccount: state.tempAccount,
    positiveColor: state.settings.theme.positiveColor,
    negativeColor: state.settings.theme.negativeColor,
});

export default connect(mapStateToProps)(OnboardingButtons);
