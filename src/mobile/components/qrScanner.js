import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity, PermissionsAndroid } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { translate } from 'react-i18next';
import GENERAL from '../theme/general';
import { isAndroid } from '../util/device';
import { width, height } from '../util/dimensions';

const styles = StyleSheet.create({
    qrInfoText: {
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
        borderWidth: 1.2,
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

class QRScanner extends Component {
    static async requestCameraPermission() {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
            title: 'QR Scanner permission',
            message: 'The wallet needs access to your camera to scan a QR code.',
        });
    }

    static propTypes = {
        t: PropTypes.func.isRequired,
        onQRRead: PropTypes.func.isRequired,
        hideModal: PropTypes.func.isRequired,
        body: PropTypes.object.isRequired,
        primary: PropTypes.object.isRequired,
    };

    static defaultProps = {
        ctaBorderColor: 'transparent',
    };

    componentWillMount() {
        if (isAndroid) {
            QRScanner.requestCameraPermission();
        }
    }

    render() {
        const {
            t,
            body,
            primary,
        } = this.props;

        return (
            <View style={styles.modalContent}>
                <View style={{ alignItems: 'center', backgroundColor: body.bg }}>
                    <View style={{ height: height / 12 }} />
                    <Text style={[styles.qrInfoText, { color: body.color }]}>{t('scan')}</Text>
                    <QRCodeScanner onRead={(data) => this.props.onQRRead(data.data)} />
                    <View style={{ paddingBottom: height / 15 }}>
                        <TouchableOpacity
                            style={[styles.closeButton, { backgroundColor: primary.color }, { borderColor: 'transparent' }]}
                            onPress={() => this.props.hideModal()}
                        >
                            <Text style={[styles.closeButtonText, { color: primary.body }]}>
                                {t('global:close')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
}

export default translate(['qrScanner', 'global'])(QRScanner);
