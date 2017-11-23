import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ImageBackground } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';

const width = Dimensions.get('window').width;
const height = global.height;

class QRScanner extends React.Component {
    render() {
        return (
            <View style={styles.modalContent}>
                <ImageBackground source={require('../../shared/images/bg-blue.png')} style={{ alignItems: 'center' }}>
                    <View style={{ height: height / 12 }} />
                    <Text style={styles.qrInfoText}>Scan your QR Code</Text>
                    <QRCodeScanner onRead={data => this.props.onQRRead(data.data)} />
                    <View style={{ paddingBottom: height / 15 }}>
                        <TouchableOpacity style={styles.closeButton} onPress={() => this.props.hideModal()}>
                            <Text style={styles.closeButtonText}>CLOSE</Text>
                        </TouchableOpacity>
                    </View>
                </ImageBackground>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    qrInfoText: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        textAlign: 'center',
        fontSize: width / 23,
    },
    closeButton: {
        flexDirection: 'row',
        borderColor: 'rgba(255, 255, 255, 0.6)',
        borderWidth: 1.5,
        borderRadius: 8,
        width: width / 2.5,
        height: height / 15,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#009f3f',
    },
    closeButtonText: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 29.6,
        backgroundColor: 'transparent',
    },
    modalContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});

module.exports = QRScanner;
