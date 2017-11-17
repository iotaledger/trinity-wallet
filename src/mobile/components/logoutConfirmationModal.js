import React, { Component } from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity, Dimensions, ImageBackground } from 'react-native';
import { TextField } from 'react-native-material-textfield';
import { connect } from 'react-redux';
import OnboardingButtons from './onboardingButtons.js';

const width = Dimensions.get('window').width
const height = global.height;

class LogoutConfirmationModal extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <ImageBackground source={require('../../shared/images/bg-green.png')} style={{ width: width / 1.15, alignItems: 'center' }}>
                <View style={styles.modalContent}>
                    <Text style={styles.questionText}>Are you sure you want to log out?</Text>
                    <OnboardingButtons
                        onLeftButtonPress={() => this.props.hideModal()}
                        onRightButtonPress={() => this.props.logout()}
                        leftText={'NO'}
                        rightText={'YES'}
                    />
                </View>
            </ImageBackground>
        );
    }
}

const styles = StyleSheet.create({
    modalContent: {
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        paddingVertical: height / 18,
        width: width / 1.15
    },
    questionText: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 27.6,
        paddingBottom: height / 16
    },
});

export default LogoutConfirmationModal;
