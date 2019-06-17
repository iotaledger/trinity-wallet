import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, View, StyleSheet, PermissionsAndroid, TouchableOpacity } from 'react-native';
import { QRscanner } from 'react-native-qr-scanner';
import { withNamespaces } from 'react-i18next';
import { Styling } from 'ui/theme/general';
import { isAndroid } from 'libs/device';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import { height, width } from 'libs/dimensions';
import { Icon } from 'ui/theme/icons';
import ModalView from './ModalView';

const styles = StyleSheet.create({
    qrText: {
        fontFamily: 'SourceSansPro-Regular',
        textAlign: 'center',
        fontSize: Styling.fontSize4,
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
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** QrCodeScanner onRead event callback function
         * @param {object} data
         */
        onQRRead: PropTypes.func.isRequired,
        /** Hide active modal */
        hideModal: PropTypes.func.isRequired,
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

    constructor() {
        super();
        this.state = {
            cameraType: 'back',
        };
    }

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

    changeCamera() {
        this.setState({ cameraType: this.state.cameraType === 'front' ? 'back' : 'front' });
    }

    render() {
        const {
            t,
            theme: { body, primary },
            displayTopBar,
        } = this.props;
        return (
            <ModalView
                displayTopBar={displayTopBar}
                onButtonPress={() => this.props.hideModal()}
                buttonText={t('global:close')}
            >
                <View style={{ flex: isAndroid ? 1 : 0, width, height: width, justifyContent: 'center' }}>
                    <QRscanner
                        onRead={(data) => this.props.onQRRead(data.data)}
                        rectHeight={width * 0.75}
                        rectWidth={width * 0.75}
                        hintText=""
                        zoom={isAndroid ? 0.05 : 0.2}
                        hintTextPosition={isAndroid ? width * 1.25 : width - width / 9}
                        topViewStyle={{ height: isAndroid ? width / 4 : 0 }}
                        bottomViewStyle={{ height: isAndroid ? width / 4 : 0 }}
                        renderBottomView={() => <View style={{ flex: 1, backgroundColor: body.bg }} />}
                        renderTopView={() => <View style={{ flex: 1, backgroundColor: body.bg }} />}
                        bottomHeight={0}
                        cornerColor={primary.color}
                        scanBarColor={primary.color}
                        cameraType={this.state.cameraType}
                    />
                </View>
                <View
                    style={[
                        { width, alignItems: 'center' },
                        isAndroid ? { position: 'absolute', bottom: height / 6 } : { marginTop: height / 20 },
                    ]}
                >
                    <TouchableOpacity onPress={() => this.changeCamera()}>
                        <Icon name="cameraFlip" size={width / 10} color={body.color} />
                    </TouchableOpacity>
                </View>
                <Text
                    style={[
                        styles.qrText,
                        {
                            color: body.color,
                            position: 'absolute',
                            top: displayTopBar || isAndroid ? height / 14 : height / 10,
                        },
                    ]}
                >
                    {t('scan')}
                </Text>
            </ModalView>
        );
    }
}

export default withNamespaces(['qrScanner', 'global'])(QRScanner);
