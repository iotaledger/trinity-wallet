import React, { Component } from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import OnboardingButtons from './onboardingButtons.js';

import { width, height } from '../util/dimensions';

class LogoutConfirmationModal extends React.Component {
    render() {
        const { t } = this.props;

        return (
            <ImageBackground
                source={require('iota-wallet-shared-modules/images/bg-blue.png')}
                style={{ width: width / 1.15, alignItems: 'center' }}
            >
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
        width: width / 1.15,
    },
    questionText: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 27.6,
        paddingBottom: height / 16,
    },
});

export default LogoutConfirmationModal;
