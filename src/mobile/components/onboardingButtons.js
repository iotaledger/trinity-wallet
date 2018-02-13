import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import GENERAL from '../theme/general';
import { width, height } from '../util/dimensions';

const styles = StyleSheet.create({
    buttonsContainer: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    button: {
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
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
    static propTypes = {
        buttonWidth: PropTypes.object,
        containerWidth: PropTypes.object,
    };

    static defaultProps = {
        buttonWidth: { width: width / 2.7 },
        containerWidth: { width: width / 1.2 },
    };

    render() {
        const { style, positiveColor, negativeColor, opacity, buttonWidth, containerWidth } = this.props;
        const positiveTextColor = { color: positiveColor };
        const positiveBorderColor = { borderColor: positiveColor };
        const negativeTextColor = { color: negativeColor };
        const negativeBorderColor = { borderColor: negativeColor };
        const rightButtonOpacity = { opacity };

        return (
            <View style={[styles.buttonsContainer, containerWidth]}>
                <TouchableOpacity onPress={() => this.props.onLeftButtonPress()} testID={this.props.leftButtonTestID}>
                    <View style={[styles.button, buttonWidth, negativeBorderColor]}>
                        <Text style={[styles.text, negativeTextColor]}>{this.props.leftText}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.props.onRightButtonPress()} testID={this.props.rightButtonTestID}>
                    <View style={[styles.button, buttonWidth, positiveBorderColor, rightButtonOpacity]}>
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
