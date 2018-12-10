import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, PermissionsAndroid } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { withNamespaces } from 'react-i18next';
import { Styling } from 'ui/theme/general';
import { isAndroid } from 'libs/device';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import ModalView from './ModalView';

const styles = StyleSheet.create({
    qrInfoText: {
        fontFamily: 'SourceSansPro-Regular',
        textAlign: 'center',
        fontSize: Styling.fontSize4,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        /** Determines whether to display top bar */
        displayTopBar: PropTypes.bool,
    };

    static defaultProps = {
        ctaBorderColor: 'transparent',
        displayTopBar: false,
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
        const { t, theme: { body }, displayTopBar } = this.props;
        return (
            <ModalView
                displayTopBar={displayTopBar}
                onButtonPress={() => this.props.hideModal()}
                buttonText={t('global:close')}
            >
                <View style={styles.textContainer}>
                    <Text style={[styles.qrInfoText, { color: body.color }]}>{t('scan')}</Text>
                </View>
                <QRCodeScanner onRead={(data) => this.props.onQRRead(data.data)} />
                <View style={{ flex: 2.5 }} />
            </ModalView>
        );
    }
}

export default withNamespaces(['qrScanner', 'global'])(QRScanner);
