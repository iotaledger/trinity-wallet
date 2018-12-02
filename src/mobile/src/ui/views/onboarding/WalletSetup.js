import isBoolean from 'lodash/isBoolean';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withNamespaces, Trans } from 'react-i18next';
import { StyleSheet, View, Text } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { connect } from 'react-redux';
import { MAX_SEED_LENGTH } from 'shared-modules/libs/iota/utils';
import RNExitApp from 'react-native-exit-app';
import RNIsDeviceRooted from 'react-native-is-device-rooted';
import { generateAlert } from 'shared-modules/actions/alerts';
import { toggleModalActivity } from 'shared-modules/actions/ui';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import InfoBox from 'ui/components/InfoBox';
import { Icon } from 'ui/theme/icons';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import Header from 'ui/components/Header';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import { doAttestationFromSafetyNet } from 'libs/safetynet';
import { isAndroid } from 'libs/device';

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
        fontSize: Styling.fontSize3,
        textAlign: 'left',
        paddingTop: height / 60,
        backgroundColor: 'transparent',
    },
    infoTextLight: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
    },
    infoTextRegular: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
    },
    greetingTextContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: width / 1.5,
    },
    greetingText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize4,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
});

/** Wallet setup screen component */
class WalletSetup extends Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        toggleModalActivity: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
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
        const { theme: { body } } = this.props;
        Navigation.push('appStack', {
            component: {
                name: 'enterSeed',
                options: {
                    animations: {
                        push: {
                            enable: false,
                        },
                        pop: {
                            enable: false,
                        },
                    },
                    layout: {
                        backgroundColor: body.bg,
                        orientation: ['portrait'],
                    },
                    topBar: {
                        visible: false,
                        drawBehind: true,
                        elevation: 0,
                    },
                    statusBar: {
                        drawBehind: true,
                        backgroundColor: body.bg,
                    },
                },
            },
        });
    }

    /**
     * Navigates to new seed setup screen
     * @method redirectToNewSeedSetupScreen
     */
    redirectToNewSeedSetupScreen() {
        const { theme: { body } } = this.props;
        Navigation.push('appStack', {
            component: {
                name: 'newSeedSetup',
                options: {
                    animations: {
                        push: {
                            enable: false,
                        },
                        pop: {
                            enable: false,
                        },
                    },
                    layout: {
                        backgroundColor: body.bg,
                        orientation: ['portrait'],
                    },
                    topBar: {
                        visible: false,
                        drawBehind: true,
                        elevation: 0,
                    },
                    statusBar: {
                        drawBehind: true,
                        backgroundColor: body.bg,
                    },
                },
            },
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
                        this.showModal();
                    }
                })
                .catch((error) => {
                    if (error.message === 'device rooted.') {
                        this.showModal();
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
                        this.showModal();
                    }
                })
                .catch((err) => console.error(err)); // eslint-disable-line no-console
        }
    }

    showModal() {
        const { theme: { negative, body } } = this.props;
        this.props.toggleModalActivity('rootDetection', {
            style: { flex: 1 },
            hideModal: () => this.hideModal(),
            closeApp: () => this.closeApp(),
            backgroundColor: body.bg,
            warningColor: { color: negative.color },
            textColor: { color: body.color },
            borderColor: { borderColor: body.color },
        });
    }

    /**
     * Hides active modal
     * @method hideModal
     */
    hideModal() {
        this.props.toggleModalActivity();
    }

    /**
     * Hides active modal and closes the application
     * @method closeApp
     */
    closeApp() {
        this.hideModal();
        RNExitApp.exitApp();
    }

    render() {
        const { t, theme: { body } } = this.props;
        const textColor = { color: body.color };

        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
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
                    <DualFooterButtons
                        onLeftButtonPress={() => this.redirectToEnterSeedScreen()}
                        onRightButtonPress={() => this.redirectToNewSeedSetupScreen()}
                        leftButtonText={t('noIHaveOne')}
                        rightButtonText={t('yesINeedASeed')}
                        leftButtonTestID="walletSetup-no"
                        rightButtonTestID="walletSetup-yes"
                    />
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
});

const mapDispatchToProps = {
    generateAlert,
    toggleModalActivity,
};

export default withNamespaces(['walletSetup', 'global'])(connect(mapStateToProps, mapDispatchToProps)(WalletSetup));
