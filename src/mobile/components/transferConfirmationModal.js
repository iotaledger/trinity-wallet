import React, { Component } from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity, Dimensions, ImageBackground } from 'react-native';
import { connect } from 'react-redux';
import OnboardingButtons from '../components/onboardingButtons.js';

const { height, width } = Dimensions.get('window');

class TransferConfirmationModal extends React.Component {
    constructor(props) {
        super(props);
    }
    onSendPress() {
        this.props.sendTransfer();
        this.props.hideModal();
    }

    render() {
        return (
            <ImageBackground source={require('../../shared/images/bg-green.png')} style={{ alignItems: 'center' }}>
                <View style={styles.modalContent}>
                    <View style={styles.textContainer}>
                        <Text style={styles.regularText}>
                            <Text style={styles.regularText}>You are about to send </Text>
                            <Text style={styles.iotaText}>
                                {' '}
                                {this.props.amount} {this.props.denomination}{' '}
                            </Text>
                            <Text style={styles.middleText}> to the address:</Text>
                        </Text>
                        <Text style={styles.addressText}> {this.props.address} </Text>
                    </View>
                    <OnboardingButtons
                        onLeftButtonPress={() => this.props.hideModal()}
                        onRightButtonPress={() => this.onSendPress()}
                        leftText={'CANCEL'}
                        rightText={'SEND'}
                    />
                </View>
            </ImageBackground>
        );
    }
}

const styles = StyleSheet.create({
    modalContent: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        paddingHorizontal: width / 15,
        paddingTop: width / 15,
        paddingBottom: width / 20,
    },
    textContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    regularText: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Light',
        fontSize: width / 31.8,
    },
    middleText: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Light',
        fontSize: width / 31.8,
        paddingBottom: height / 80,
    },
    addressText: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 31.8,
        marginBottom: height / 30,
        paddingHorizontal: width / 80,
    },
    iotaText: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 27.6,
    },
});

export default TransferConfirmationModal;
