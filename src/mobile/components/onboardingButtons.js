import get from 'lodash/get';
import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

const { height, width } = Dimensions.get('window');

export default class OnboardingButtons extends Component {
    render() {
        const { style } = this.props;
        return (
            <View style={styles.buttonsContainer}>
                <TouchableOpacity onPress={event => this.props.onLeftButtonPress()}>
                    <View style={[styles.leftButton, get(style, 'leftButton')]}>
                        <Text style={[styles.leftText, get(style, 'leftText')]}>{this.props.leftText}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={event => this.props.onRightButtonPress()}>
                    <View style={[styles.rightButton, get(style, 'rightButton')]}>
                        <Text style={[styles.rightText, get(style, 'rightText')]}>{this.props.rightText}</Text>
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
        borderColor: '#9DFFAF',
        borderWidth: 1.2,
        borderRadius: 10,
        width: width / 3,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    rightText: {
        color: '#9DFFAF',
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
    leftButton: {
        borderColor: '#F7D002',
        borderWidth: 1.2,
        borderRadius: 10,
        width: width / 3,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginRight: width / 14,
    },
    leftText: {
        color: '#F7D002',
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
});
