import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, PermissionsAndroid } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { withNamespaces } from 'react-i18next';
import { Styling } from 'ui/theme/general';
import { isAndroid, isIPhoneX } from 'libs/device';
import { width, height } from 'libs/dimensions';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import SingleFooterButton from 'ui/components/SingleFooterButton';
import DynamicStatusBar from './DynamicStatusBar';

const styles = StyleSheet.create({
    qrInfoText: {
        fontFamily: 'SourceSansPro-Regular',
        textAlign: 'center',
        fontSize: Styling.fontSize4,
    },
    closeButton: {
        flexDirection: 'row',
        borderRadius: Styling.borderRadius,
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
        fontSize: Styling.fontSize3,
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
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** QrCodeScanner onRead event callback function
         * @param {object} data
         */
        onQRRead: PropTypes.func.isRequired,
        /** Hide active modal */
        hideModal: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** Mount lifecycle method calback function  */
        onMount: PropTypes.func,
        /** Unmount lifecycle method calback function  */
        onUnmount: PropTypes.func,
    };

    static defaultProps = {
        ctaBorderColor: 'transparent',
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('QRScanner');
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
        const { t, theme: { body } } = this.props;
        return (
            <View style={styles.modalContent}>
                <View style={{ alignItems: 'center', backgroundColor: body.bg }}>
                    <DynamicStatusBar backgroundColor={body.bg} isModalActive />
                    <View style={{ height: height / 12 }} />
                    <Text style={[styles.qrInfoText, { color: body.color }]}>{t('scan')}</Text>
                    <QRCodeScanner onRead={(data) => this.props.onQRRead(data.data)} />
                    <View style={{ paddingBottom: isIPhoneX ? 34 : 0 }}>
                        <SingleFooterButton
                            onButtonPress={() => this.props.hideModal()}
                            testID="qrScanner-next"
                            buttonText={t('global:close')}
                        />
                    </View>
                </View>
            </View>
        );
    }
}

export default withNamespaces(['qrScanner', 'global'])(QRScanner);
