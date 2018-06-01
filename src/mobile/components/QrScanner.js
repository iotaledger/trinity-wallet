import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity, PermissionsAndroid } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { translate } from 'react-i18next';
import DynamicStatusBar from '../components/DynamicStatusBar';
import GENERAL from '../theme/general';
import { isAndroid } from '../utils/device';
import { width, height } from '../utils/dimensions';

const styles = StyleSheet.create({
    qrInfoText: {
        fontFamily: 'SourceSansPro-Regular',
        textAlign: 'center',
        fontSize: GENERAL.fontSize4,
    },
    closeButton: {
        flexDirection: 'row',
        borderRadius: GENERAL.borderRadius,
        width: width / 2.5,
        height: height / 14,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#009f3f',
        borderWidth: 1.2,
    },
    closeButtonText: {
        color: 'white',
        fontFamily: 'SourceSansPro-SemiBold',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
    },
    modalContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export class QRScanner extends Component {
    static async requestCameraPermission() {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
            title: 'QR Scanner permission',
            message: 'The wallet needs access to your camera to scan a QR code.',
        });
    }

    static propTypes = {
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** QrCodeScanner onRead event callback function
         * @param {object} data
         */
        onQRRead: PropTypes.func.isRequired,
        /** Hide active modal */
        hideModal: PropTypes.func.isRequired,
        /** Content base colors */
        body: PropTypes.object.isRequired,
        primary: PropTypes.object.isRequired,
        /** Mount lifecycle method calback function  */
        onMount: PropTypes.func,
        /** Unmount lifecycle method calback function  */
        onUnmount: PropTypes.func,
    };

    static defaultProps = {
        ctaBorderColor: 'transparent',
    };

    componentDidMount() {
        if (this.props.onMount) {
            this.props.onMount();
        }

        if (isAndroid) {
            QRScanner.requestCameraPermission();
        }
    }

    componentWillUnmount() {
        if (this.props.onUnmount) {
            this.props.onUnmount();
        }
    }

    render() {
        const { t, body, primary } = this.props;

        return (
            <View style={styles.modalContent}>
                <View style={{ alignItems: 'center', backgroundColor: body.bg }}>
                    <DynamicStatusBar backgroundColor={body.bg} isModalActive />
                    <View style={{ height: height / 12 }} />
                    <Text style={[styles.qrInfoText, { color: body.color }]}>{t('scan')}</Text>
                    <QRCodeScanner onRead={(data) => this.props.onQRRead(data.data)} />
                    <View style={{ paddingBottom: height / 15 }}>
                        <TouchableOpacity
                            style={[
                                styles.closeButton,
                                { backgroundColor: primary.color },
                                { borderColor: 'transparent' },
                            ]}
                            onPress={() => this.props.hideModal()}
                        >
                            <Text style={[styles.closeButtonText, { color: primary.body }]}>{t('global:close')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
}

export default translate(['qrScanner', 'global'])(QRScanner);
