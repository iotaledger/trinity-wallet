import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { setFingerprintStatus } from 'shared/actions/settings';
import { generateAlert } from 'shared/actions/alerts';
import { connect } from 'react-redux';
import FingerprintScanner from 'react-native-fingerprint-scanner';
import { translate } from 'react-i18next';
import Modal from 'react-native-modal';
import WithBackPressGoToHome from 'mobile/src/ui/components/BackPressGoToHome';
import DynamicStatusBar from 'mobile/src/ui/components/DynamicStatusBar';
import FingerPrintModal from 'mobile/src/ui/components/FingerprintModal';
import Fonts from 'mobile/src/ui/theme/fonts';
import StatefulDropdownAlert from 'mobile/src/ui/components/StatefulDropdownAlert';
import { width, height } from 'mobile/src/libs/dimensions';
import GENERAL from 'mobile/src/ui/theme/general';
import { Icon } from 'mobile/src/ui/theme/icons.js';
import Button from 'mobile/src/ui/components/Button';
import { isAndroid, isIPhoneX } from 'mobile/src/libs/device';
import { leaveNavigationBreadcrumb } from 'mobile/src/libs/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topWrapper: {
        flex: 0.3,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 16,
        width,
    },
    midWrapper: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: width / 10,
    },
    bottomWrapper: {
        flex: 0.3,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    subHeaderText: {
        fontFamily: Fonts.secondary,
        fontSize: GENERAL.fontSize5,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoText: {
        fontFamily: Fonts.secondary,
        fontSize: GENERAL.fontSize4,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    modal: {
        height,
        width,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
    },
    button: {
        width: width / 1.65,
        height: height / 3.3,
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: width / 12,
        borderRadius: GENERAL.borderRadius,
        borderWidth: 1,
    },
});

/** Fingerprint enable component */
class FingerprintEnable extends Component {
    static propTypes = {
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        setFingerprintStatus: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        isFingerprintEnabled: PropTypes.bool.isRequired,
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = { isModalVisible: false };
        this.navigateToHome = this.navigateToHome.bind(this);
        this.handleAuthenticationAttempted = this.handleAuthenticationAttempted.bind(this);
        this.navigateToHome = this.navigateToHome.bind(this);
        this.onFingerprintPress = this.onFingerprintPress.bind(this);
        this.hideModal = this.hideModal.bind(this);
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('FingerprintEnable');
    }

    componentWillUnmount() {
        if (isAndroid) {
            FingerprintScanner.release();
        }
    }

    /**
     * Wrapper method for activation/deactivation of fingerprint
     */
    onFingerprintPress() {
        const { isFingerprintEnabled } = this.props;
        if (isFingerprintEnabled) {
            this.deactivateFingerprintScanner();
        } else {
            this.activateFingerprintScanner();
        }
    }

    getButtonInstructions() {
        const { t, isFingerprintEnabled } = this.props;
        if (isIPhoneX) {
            return isFingerprintEnabled ? t('buttonInstructionsDisableIPhoneX') : t('buttonInstructionsEnableIPhoneX');
        }
        return isFingerprintEnabled ? t('buttonInstructionsDisable') : t('buttonInstructionsEnable');
    }

    openModal() {
        this.setState({ isModalVisible: true });
    }

    activateFingerprintScanner() {
        const { t } = this.props;
        if (isAndroid) {
            this.openModal();
        }
        FingerprintScanner.isSensorAvailable()
            .then(
                FingerprintScanner.authenticate({
                    description: t('instructionsEnable'),
                    onAttempt: this.handleAuthenticationAttempted,
                })
                    .then(() => {
                        if (isAndroid) {
                            this.hideModal();
                        }
                        this.props.setFingerprintStatus(true);
                        this.timeout = setTimeout(() => {
                            this.props.generateAlert(
                                'success',
                                t('fingerprintAuthEnabled'),
                                t('fingerprintAuthEnabledExplanation'),
                            );
                        }, 300);
                    })
                    .catch(() => {
                        this.props.generateAlert(
                            'error',
                            t('fingerprintAuthFailed'),
                            t('fingerprintAuthFailedExplanation'),
                        );
                    }),
            )
            .catch(() => {
                this.props.generateAlert('error', t('fingerprintUnavailable'), t('fingerprintUnavailableExplanation'));
            });
    }

    deactivateFingerprintScanner() {
        const { t } = this.props;
        if (isAndroid) {
            this.openModal();
        }
        FingerprintScanner.authenticate({
            description: t('instructionsDisable'),
            onAttempt: this.handleAuthenticationAttempted,
        })
            .then(() => {
                if (isAndroid) {
                    this.hideModal();
                }
                this.props.setFingerprintStatus(false);
                this.timeout = setTimeout(() => {
                    this.props.generateAlert(
                        'success',
                        t('fingerprintAuthDisabled'),
                        t('fingerprintAuthDisabledExplanation'),
                    );
                }, 300);
            })
            .catch(() => {
                this.props.generateAlert('error', t('fingerprintAuthFailed'), t('fingerprintAuthFailedExplanation'));
            });
    }

    handleAuthenticationAttempted() {
        const { t } = this.props;
        Alert.alert(t('fingerprintAuthFailed'), t('fingerprintAuthFailedExplanation'));
    }

    navigateToHome() {
        this.props.navigator.pop({
            animated: false,
        });
    }

    hideModal() {
        this.setState({ isModalVisible: false });
    }

    render() {
        const { isModalVisible } = this.state;
        const { t, isFingerprintEnabled, theme } = this.props;
        const backgroundColor = { backgroundColor: theme.body.bg };
        const textColor = { color: theme.body.color };
        const authenticationStatus = isFingerprintEnabled ? t('disable') : t('enable');
        const instructions = this.getButtonInstructions();

        return (
            <View style={[styles.container, backgroundColor]}>
                <DynamicStatusBar backgroundColor={theme.body.bg} />
                <View style={styles.topWrapper}>
                    <Icon name="iota" size={width / 8} color={theme.body.color} />
                </View>
                <View style={styles.midWrapper}>
                    <View style={{ flex: 0.25 }} />
                    <Text style={[styles.infoText, textColor]}>{instructions}</Text>
                    <View style={{ flex: 0.2 }} />
                    <TouchableOpacity
                        onPress={this.onFingerprintPress}
                        style={[styles.button, { borderColor: theme.body.color }]}
                    >
                        <Icon name="fingerprintLarge" size={width / 4.6} color={theme.body.color} />
                        <Text style={[styles.subHeaderText, textColor]}>{authenticationStatus}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.bottomWrapper}>
                    <Button
                        onPress={() => this.navigateToHome()}
                        style={{
                            wrapper: { backgroundColor: theme.primary.color },
                            children: { color: theme.primary.body },
                        }}
                    >
                        {t('global:done')}
                    </Button>
                </View>
                <StatefulDropdownAlert textColor={theme.body.color} backgroundColor={theme.body.bg} />
                <Modal
                    animationIn={isAndroid ? 'bounceInUp' : 'zoomIn'}
                    animationOut={isAndroid ? 'bounceOut' : 'zoomOut'}
                    animationInTiming={isAndroid ? 1000 : 300}
                    animationOutTiming={200}
                    backdropTransitionInTiming={isAndroid ? 500 : 300}
                    backdropTransitionOutTiming={200}
                    backdropOpacity={0.9}
                    backdropColor={theme.body.bg}
                    style={styles.modal}
                    isVisible={isModalVisible}
                    onBackButtonPress={this.hideModal}
                    hideModalContentWhileAnimating
                    useNativeDriver={isAndroid ? true : false}
                >
                    <FingerPrintModal
                        hideModal={this.hideModal}
                        borderColor={{ borderColor: theme.body.color }}
                        textColor={textColor}
                        backgroundColor={backgroundColor}
                        instance="setup"
                        isFingerprintEnabled={isFingerprintEnabled}
                    />
                </Modal>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
    isFingerprintEnabled: state.settings.isFingerprintEnabled,
});

const mapDispatchToProps = {
    setFingerprintStatus,
    generateAlert,
};

export default WithBackPressGoToHome()(
    translate(['fingerprintSetup', 'global'])(connect(mapStateToProps, mapDispatchToProps)(FingerprintEnable)),
);
