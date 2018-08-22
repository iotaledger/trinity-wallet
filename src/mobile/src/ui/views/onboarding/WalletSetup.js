import isBoolean from 'lodash/isBoolean';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate, Trans } from 'react-i18next';
import { StyleSheet, View, Text } from 'react-native';
import { connect } from 'react-redux';
import { MAX_SEED_LENGTH } from 'shared/libs/iota/utils';
import Modal from 'react-native-modal';
import RNExitApp from 'react-native-exit-app';
import RNIsDeviceRooted from 'react-native-is-device-rooted';
import { generateAlert } from 'shared/actions/alerts';
import OnboardingButtons from 'mobile/src/ui/components/OnboardingButtons';
import InfoBox from 'mobile/src/ui/components/InfoBox';
import { Icon } from 'mobile/src/ui/theme/icons.js';
import DynamicStatusBar from 'mobile/src/ui/components/DynamicStatusBar';
import { width, height } from 'mobile/src/libs/dimensions';
import GENERAL from 'mobile/src/ui/theme/general';
import Header from 'mobile/src/ui/components/Header';
import { leaveNavigationBreadcrumb } from 'mobile/src/libs/bugsnag';
import RootDetectionModalComponent from 'mobile/src/ui/components/RootDetectionModal';
import { doAttestationFromSafetyNet } from 'mobile/src/libs/safetynet';
import { isAndroid } from 'mobile/src/libs/device';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 16,
    },
    midContainer: {
        flex: 3,
        alignItems: 'center',
    },
    bottomContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
        textAlign: 'left',
        paddingTop: height / 60,
        backgroundColor: 'transparent',
    },
    infoTextLight: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
    },
    infoTextRegular: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
    },
    greetingTextContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: width / 1.5,
    },
    greetingText: {
        fontFamily: 'SourceSansPro-Light',
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
});

/** Wallet setup screen component */
class WalletSetup extends Component {
    static propTypes = {
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            isModalVisible: false,
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('WalletSetup');
        this.showModalIfRooted();
    }

    /**
     * Navigates to enter seed screen
     * @method redirectToEnterSeedScreen
     */
    redirectToEnterSeedScreen() {
        const { theme } = this.props;

        this.props.navigator.push({
            screen: 'enterSeed',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                topBarElevationShadowEnabled: false,
                screenBackgroundColor: theme.body.bg,
                drawUnderStatusBar: true,
                statusBarColor: theme.body.bg,
            },
            animated: false,
        });
    }

    /**
     * Navigates to new seed setup screen
     * @method redirectToNewSeedSetupScreen
     */
    redirectToNewSeedSetupScreen() {
        const { theme } = this.props;
        this.props.navigator.push({
            screen: 'newSeedSetup',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                topBarElevationShadowEnabled: false,
                screenBackgroundColor: theme.body.bg,
                drawUnderStatusBar: true,
                statusBarColor: theme.body.bg,
            },
            animated: false,
        });
    }

    /**
     * Displays a modal if device is rooted (Android)
     * @method showModalIfRooted
     */
    showModalIfRooted() {
        // FIXME: Have UI indicators for this request
        if (isAndroid) {
            RNIsDeviceRooted.isDeviceRooted()
                .then((isRooted) => {
                    if (isRooted) {
                        throw new Error('device rooted.');
                    }
                    return doAttestationFromSafetyNet();
                })
                .then((isRooted) => {
                    if (isBoolean(isRooted) && isRooted) {
                        this.setState({ isModalVisible: true });
                    }
                })
                .catch((error) => {
                    if (error.message === 'device rooted.') {
                        this.setState({ isModalVisible: true });
                    }
                    if (error.message === 'play services not available.') {
                        this.props.generateAlert(
                            'error',
                            this.props.t('global:googlePlayServicesNotAvailable'),
                            this.props.t('global:couldNotVerifyDeviceIntegrity'),
                        );
                    }
                });
        } else {
            RNIsDeviceRooted.isDeviceRooted()
                .then((isRooted) => {
                    if (isRooted) {
                        this.setState({ isModalVisible: true });
                    }
                })
                .catch((err) => console.error(err)); // eslint-disable-line no-console
        }
    }

    /**
     * Hides active modal
     * @method hideModal
     */
    hideModal() {
        this.setState({ isModalVisible: false });
    }

    /**
     * Hides active modal and closes the application
     * @method closeApp
     */
    closeApp() {
        this.hideModal();
        RNExitApp.exitApp();
    }

    renderModalContent() {
        const { theme: { body, negative } } = this.props;
        return (
            <RootDetectionModalComponent
                style={{ flex: 1 }}
                hideModal={() => this.hideModal()}
                closeApp={() => this.closeApp()}
                backgroundColor={body.bg}
                warningColor={{ color: negative.color }}
                textColor={{ color: body.color }}
                borderColor={{ borderColor: body.color }}
            />
        );
    }

    render() {
        const { t, theme: { body } } = this.props;
        const textColor = { color: body.color };
        const { isModalVisible } = this.state;

        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <DynamicStatusBar backgroundColor={body.bg} />
                <View style={styles.topContainer}>
                    <Icon name="iota" size={width / 8} color={body.color} />
                    <View style={{ flex: 0.7 }} />
                    <Header textColor={body.color}>{t('welcome:thankYou')}</Header>
                </View>
                <View style={styles.midContainer}>
                    <View style={{ flex: 0.05 }} />
                    <View style={styles.greetingTextContainer}>
                        <Text style={[styles.greetingText, textColor]}>{t('doYouNeedASeed')}</Text>
                    </View>
                    <View style={{ flex: 0.25 }} />
                    <InfoBox
                        body={body}
                        text={
                            <View>
                                <Text style={[styles.infoText, textColor]}>
                                    {t('seedExplanation', { maxLength: MAX_SEED_LENGTH })}
                                </Text>
                                <Trans i18nKey="walletSetup:explanation">
                                    <Text style={[styles.infoText, textColor]}>
                                        <Text style={styles.infoTextLight}>
                                            You can use it to access your funds from
                                        </Text>
                                        <Text style={styles.infoTextRegular}> any wallet</Text>
                                        <Text style={styles.infoTextLight}>, on</Text>
                                        <Text style={styles.infoTextRegular}> any device.</Text>
                                    </Text>
                                </Trans>
                                <Text style={[styles.infoText, textColor]}>{t('loseSeed')}</Text>
                            </View>
                        }
                    />
                </View>
                <View style={styles.bottomContainer}>
                    <OnboardingButtons
                        onLeftButtonPress={() => this.redirectToEnterSeedScreen()}
                        onRightButtonPress={() => this.redirectToNewSeedSetupScreen()}
                        leftButtonText={t('noIHaveOne')}
                        rightButtonText={t('yesINeedASeed')}
                        leftButtonTestID="walletSetup-no"
                        rightButtonTestID="walletSetup-yes"
                    />
                </View>
                <Modal
                    animationIn="zoomIn"
                    animationOut="zoomOut"
                    animationInTiming={300}
                    animationOutTiming={200}
                    backdropTransitionInTiming={300}
                    backdropTransitionOutTiming={200}
                    backdropColor={body.bg}
                    backdropOpacity={0.9}
                    style={styles.modal}
                    isVisible={isModalVisible}
                    onBackButtonPress={() => this.setState({ isModalVisible: false })}
                    useNativeDriver={!!isAndroid}
                >
                    {this.renderModalContent()}
                </Modal>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
});

const mapDispatchToProps = {
    generateAlert,
};

export default translate(['walletSetup', 'global'])(connect(mapStateToProps, mapDispatchToProps)(WalletSetup));
