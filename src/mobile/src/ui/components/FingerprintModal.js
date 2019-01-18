import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { withNamespaces } from 'react-i18next';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import { connect } from 'react-redux';
import FingerprintScanner from 'react-native-fingerprint-scanner';
import { Icon } from 'ui/theme/icons';
import { height, width } from 'libs/dimensions';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        height,
        width,
    },
    modalContent: {
        width,
        justifyContent: 'center',
        alignItems: 'flex-start',
        backgroundColor: '#ffffff',
        paddingHorizontal: 24,
    },
    heading: {
        color: '#212122',
        fontSize: 20,
        marginTop: 24,
    },
    footer: {
        color: '#2e8277',
        fontSize: 19,
    },
    info: {
        fontSize: 17,
        marginTop: 16,
    },
});

class FingerprintModal extends Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** Hide active modal */
        onBackButtonPress: PropTypes.func.isRequired,
        /** Determines in which instance the modal is being used*/
        instance: PropTypes.string.isRequired,
        /** @ignore */
        isFingerprintEnabled: PropTypes.bool,
        /** Triggered on fingerprint success */
        onSuccess: PropTypes.func.isRequired,
        /** @ignore */
        minimised: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);
        leaveNavigationBreadcrumb('FingerprintModal');
        this.props.onBackButtonPress = this.props.onBackButtonPress.bind(this);
        this.state = { error: undefined };
    }

    componentDidMount() {
        FingerprintScanner.authenticate({ onAttempt: this.handleAuthenticationAttempted })
            .then(() => {
                this.props.onSuccess();
                FingerprintScanner.release();
            })
            .catch((error) => {
                this.setState({ error: error.name });
            });
    }

    componentWillReceiveProps(newProps) {
        if (this.props.minimised && !newProps.minimised) {
            this.props.onBackButtonPress();
            FingerprintScanner.release();
        }
    }

    componentWillUnmount() {
        FingerprintScanner.release();
    }

    getText() {
        const { t, instance, isFingerprintEnabled } = this.props;
        let modalText = '';
        switch (instance) {
            case 'send':
                modalText = t('send:fingerprintOnSend');
                break;
            case 'login':
                modalText = t('fingerprintSetup:instructionsLogin');
                break;
            case 'setup':
                modalText = isFingerprintEnabled
                    ? t('fingerprintSetup:instructionsDisable')
                    : t('fingerprintSetup:instructionsEnable');
                break;
            default:
                break;
        }
        return modalText;
    }

    handleAuthenticationAttempted = (error) => {
        this.setState({ error: error.name });
    };

    render() {
        const { error } = this.state;
        const { t, onBackButtonPress } = this.props;
        const errors = {
            AuthenticationNotMatch: t('fingerprintSetup:fingerprintAuthFailedExplanation'),
            AuthenticationFailed: t('fingerprintSetup:fingerprintAuthFailed'),
            FingerprintScannerNotAvailable: t('fingerprintSetup:fingerprintUnavailable'),
            FingerprintScannerNotEnrolled: t('fingerprintSetup:notConfigured'),
            FingerprintScannerNotSupported: t('fingerprintSetup:notSupported'),
            DeviceLocked: t('fingerprintSetup:deviceLocked'),
            UserCancel: t('fingerprintSetup:userCancelledAuth'),
            UserFallback: t('fingerprintSetup:passwordFallback'),
            SystemCancel: t('fingerprintSetup:systemCancelledAuth'),
            PasscodeNotSet: t('fingerprintSetup:noPassword'),
        };
        return (
            <View style={styles.container}>
                <View style={styles.modalContent}>
                    <Text style={styles.heading}>{this.getText()}</Text>
                    <View style={{ width: width - 48, alignItems: 'center', marginTop: 48, marginBottom: 24 }}>
                        <Icon
                            name={(error && 'info') || 'fingerprint'}
                            size={64}
                            color={(error && '#F4511E') || '#2e8277'}
                        />
                        <Text style={[styles.info, { color: (error && '#F4511E') || '#2e8277' }]}>
                            {errors[error] || t('touchSensor')}
                        </Text>
                    </View>
                    <TouchableWithoutFeedback onPress={onBackButtonPress}>
                        <View style={{ width: width - 48, height: 72, justifyContent: 'center' }}>
                            <Text style={styles.footer}>{t('cancel').toUpperCase()}</Text>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    minimised: state.ui.minimised,
});

export default withNamespaces(['global'])(connect(mapStateToProps)(FingerprintModal));
