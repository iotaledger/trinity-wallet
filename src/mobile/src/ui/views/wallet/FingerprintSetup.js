import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { setFingerprintStatus } from 'shared-modules/actions/settings';
import { toggleModalActivity } from 'shared-modules/actions/ui';
import { generateAlert } from 'shared-modules/actions/alerts';
import { connect } from 'react-redux';
import FingerprintScanner from 'react-native-fingerprint-scanner';
import { withNamespaces } from 'react-i18next';
import WithBackPressGoToHome from 'ui/components/BackPressGoToHome';
import Fonts from 'ui/theme/fonts';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import { Icon } from 'ui/theme/icons';
import SingleFooterButton from 'ui/components/SingleFooterButton';
import { isAndroid, isIPhoneX } from 'libs/device';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

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
        fontSize: Styling.fontSize5,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoText: {
        fontFamily: Fonts.secondary,
        fontSize: Styling.fontSize4,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    button: {
        width: width / 1.65,
        height: height / 3.3,
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: width / 12,
        borderRadius: Styling.borderRadius,
        borderWidth: 1,
    },
});

/** Fingerprint enable component */
class FingerprintEnable extends Component {
    static propTypes = {
        /** Component ID */
        componentId: PropTypes.string.isRequired,
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
        /** @ignore */
        toggleModalActivity: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
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
        const { theme, isFingerprintEnabled } = this.props;
        this.props.toggleModalActivity('fingerprint', {
            hideModal: this.hideModal,
            theme,
            isFingerprintEnabled,
            instance: 'setup',
        });
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
        Navigation.pop(this.props.componentId);
    }

    hideModal() {
        this.props.toggleModalActivity();
    }

    render() {
        const { t, isFingerprintEnabled, theme } = this.props;
        const backgroundColor = { backgroundColor: theme.body.bg };
        const textColor = { color: theme.body.color };
        const authenticationStatus = isFingerprintEnabled ? t('disable') : t('enable');
        const instructions = this.getButtonInstructions();

        return (
            <View style={[styles.container, backgroundColor]}>
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
                    <SingleFooterButton
                        onButtonPress={() => this.navigateToHome()}
                        buttonStyle={{
                            wrapper: { backgroundColor: theme.primary.color },
                            children: { color: theme.primary.body },
                        }}
                        buttonText={t('global:done')}
                    />
                </View>
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
    toggleModalActivity,
};

export default WithBackPressGoToHome()(
    withNamespaces(['fingerprintSetup', 'global'])(connect(mapStateToProps, mapDispatchToProps)(FingerprintEnable)),
);
