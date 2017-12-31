import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import COLORS from '../theme/Colors';
import GENERAL from '../theme/general';
import { translate } from 'react-i18next';

import { width, height } from '../util/dimensions';

class QRScanner extends Component {
    render() {
        const { t, backgroundColor, ctaColor } = this.props;

        return (
            <View style={styles.modalContent}>
                <View style={{ alignItems: 'center', backgroundColor: backgroundColor }}>
                    <View style={{ height: height / 12 }} />
                    <Text style={styles.qrInfoText}>{t('scan')}</Text>
                    <QRCodeScanner onRead={data => this.props.onQRRead(data.data)} />
                    <View style={{ paddingBottom: height / 15 }}>
                        <TouchableOpacity
                            style={[styles.closeButton, { backgroundColor: ctaColor }]}
                            onPress={() => this.props.hideModal()}
                        >
                            <Text style={styles.closeButtonText}>{t('global:close')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
        borderRadius: GENERAL.borderRadius,
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
//TODO: translate(['qrScanner', 'global'])
