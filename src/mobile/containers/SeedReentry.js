import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { Keyboard, StyleSheet, View, Text, TouchableWithoutFeedback } from 'react-native';
import { connect } from 'react-redux';
import { MAX_SEED_LENGTH, VALID_SEED_REGEX } from 'iota-wallet-shared-modules/libs/iota/utils';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import FlagSecure from 'react-native-flag-secure-android';
import Modal from 'react-native-modal';
import WithUserActivity from '../components/UserActivity';
import ChecksumComponent from '../components/Checksum';
import ChecksumModalComponent from '../components/ChecksumModal';
import { width, height } from '../utils/dimensions';
import DynamicStatusBar from '../components/DynamicStatusBar';
import CustomTextInput from '../components/CustomTextInput';
import StatefulDropdownAlert from './StatefulDropdownAlert';
import QRScannerComponent from '../components/QrScanner';
import GENERAL from '../theme/general';
import InfoBox from '../components/InfoBox';
import OnboardingButtons from '../containers/OnboardingButtons';
import { Icon } from '../theme/icons';
import Header from '../components/Header';
import { isAndroid } from '../utils/device';
import { leaveNavigationBreadcrumb } from '../utils/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 1,
        paddingTop: height / 16,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    midContainer: {
        flex: 3,
        alignItems: 'center',
        justifyContent: 'space-between',
        width,
    },
    bottomContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    infoTextBottom: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    warningText: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: GENERAL.fontSize3,
        paddingTop: height / 60,
    },
    modal: {
        height,
        width,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
    },
});

/** Seed Reentry component */
class SeedReentry extends Component {
    static propTypes = {
        /** Generate a notification alert
         * @param {string} type - notification type - success, error
         * @param {string} title - notification title
         * @param {string} text - notification explanation
         */
        generateAlert: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** Seed value */
        seed: PropTypes.string.isRequired,
        /** Determines if the application is minimised */
        minimised: PropTypes.bool.isRequired,
    };

    constructor() {
        super();

        this.state = {
            seed: '',
            isModalVisible: false,
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('SeedReentry');
        if (isAndroid) {
            FlagSecure.activate();
        }
    }

    componentWillUnmount() {
        if (isAndroid) {
            FlagSecure.deactivate();
        }
    }

    onDonePress() {
        const { t, seed, theme: { body } } = this.props;
        if (this.state.seed === seed) {
            if (isAndroid) {
                FlagSecure.deactivate();
            }
            this.props.navigator.push({
                screen: 'setAccountName',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    topBarElevationShadowEnabled: false,
                    screenBackgroundColor: body.bg,
                    drawUnderStatusBar: true,
                    statusBarColor: body.bg,
                },
                animated: false,
            });
        } else if (this.state.seed.length === MAX_SEED_LENGTH && this.state.seed.match(VALID_SEED_REGEX)) {
            this.props.generateAlert('error', t('incorrectSeed'), t('incorrectSeedExplanation'));
        } else {
            this.props.generateAlert(
                'error',
                t('useExistingSeed:incorrectFormat'),
                t('useExistingSeed:validSeedExplanation'),
            );
        }
    }

    onBackPress() {
        const { theme: { body } } = this.props;
        this.props.navigator.pop({
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                screenBackgroundColor: body.bg,
                drawUnderStatusBar: true,
                statusBarColor: body.bg,
            },
            animated: false,
        });
    }

    onQRPress() {
        this.showModal('qr');
    }

    /**
     * Parse and validate QR data
     * @param  {String} data QR data
     */
    onQRRead(data) {
        const dataString = data.toString();
        const { t } = this.props;
        if (dataString.length === MAX_SEED_LENGTH && dataString.match(VALID_SEED_REGEX)) {
            this.setState({
                seed: data,
            });
        } else {
            this.props.generateAlert(
                'error',
                t('useExistingSeed:incorrectFormat'),
                t('useExistingSeed:validSeedExplanation'),
            );
        }
        this.hideModal();
    }

    showModal = (modalContent) => this.setState({ modalContent, isModalVisible: true });

    hideModal = () => this.setState({ isModalVisible: false });

    renderModalContent = (modalContent) => {
        const { theme: { body, primary } } = this.props;
        let content = '';
        switch (modalContent) {
            case 'qr':
                content = (
                    <QRScannerComponent
                        primary={primary}
                        body={body}
                        onQRRead={(data) => this.onQRRead(data)}
                        hideModal={() => this.hideModal()}
                    />
                );
                break;
            case 'checksum':
                content = <ChecksumModalComponent body={body} primary={primary} closeModal={() => this.hideModal()} />;
        }
        return content;
    };

    render() {
        const { modalContent, seed } = this.state;
        const { t, theme, minimised } = this.props;
        const textColor = { color: theme.body.color };

        return (
            <View style={[styles.container, { backgroundColor: theme.body.bg }]}>
                {!minimised && (
                    <View>
                        <DynamicStatusBar backgroundColor={theme.body.bg} />
                        <TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
                            <View>
                                <View style={styles.topContainer}>
                                    <Icon name="iota" size={width / 8} color={theme.body.color} />
                                    <View style={{ flex: 0.7 }} />
                                    <Header textColor={theme.body.color}>{t('pleaseConfirmYourSeed')}</Header>
                                </View>
                                <View style={styles.midContainer}>
                                    <View style={{ flex: 0.15 }} />
                                    <CustomTextInput
                                        label={t('global:seed')}
                                        onChangeText={(text) => {
                                            if (text.match(VALID_SEED_REGEX) || text.length === 0) {
                                                this.setState({ seed: text.toUpperCase() });
                                            }
                                        }}
                                        containerStyle={{ width: width / 1.15 }}
                                        maxLength={MAX_SEED_LENGTH}
                                        autoCapitalize="characters"
                                        autoCorrect={false}
                                        enablesReturnKeyAutomatically
                                        returnKeyType="done"
                                        onSubmitEditing={() => this.onDonePress()}
                                        theme={theme}
                                        value={seed}
                                        widget="qr"
                                        onQRPress={() => this.onQRPress()}
                                    />
                                    <View style={{ flex: 0.15 }} />
                                    <ChecksumComponent
                                        seed={seed}
                                        theme={theme}
                                        showModal={() => this.showModal('checksum')}
                                    />
                                    <View style={{ flex: 0.15 }} />
                                    <InfoBox
                                        body={theme.body}
                                        text={
                                            <View>
                                                <Text style={[styles.infoTextBottom, textColor]}>
                                                    {t('ifYouHaveNotSaved')}
                                                </Text>
                                                <Text style={[styles.warningText, textColor]}>
                                                    {t('trinityWillNeverAskToReenter')}
                                                </Text>
                                            </View>
                                        }
                                    />
                                    <View style={{ flex: 0.5 }} />
                                </View>
                                <View style={styles.bottomContainer}>
                                    <OnboardingButtons
                                        onLeftButtonPress={() => this.onBackPress()}
                                        onRightButtonPress={() => this.onDonePress()}
                                        leftButtonText={t(':goBack')}
                                        rightButtonText={t('global:done')}
                                    />
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                        <StatefulDropdownAlert backgroundColor={theme.body.bg} />
                        <Modal
                            animationIn={isAndroid ? 'bounceInUp' : 'zoomIn'}
                            animationOut={isAndroid ? 'bounceOut' : 'zoomOut'}
                            animationInTiming={isAndroid ? 1000 : 300}
                            animationOutTiming={200}
                            backdropTransitionInTiming={isAndroid ? 500 : 300}
                            backdropTransitionOutTiming={200}
                            backdropColor={theme.body.bg}
                            backdropOpacity={0.9}
                            style={styles.modal}
                            isVisible={this.state.isModalVisible}
                            onBackButtonPress={() => this.setState({ isModalVisible: false })}
                            hideModalContentWhileAnimating
                            useNativeDriver={isAndroid ? true : false}
                        >
                            {this.renderModalContent(modalContent)}
                        </Modal>
                    </View>
                )}
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    seed: state.wallet.seed,
    theme: state.settings.theme,
    minimised: state.ui.minimised,
});

const mapDispatchToProps = {
    generateAlert,
};

export default WithUserActivity()(
    translate(['seedReentry', 'global'])(connect(mapStateToProps, mapDispatchToProps)(SeedReentry)),
);
