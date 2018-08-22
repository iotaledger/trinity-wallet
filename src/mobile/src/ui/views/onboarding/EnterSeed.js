import React from 'react';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, StatusBar, Keyboard } from 'react-native';
import { setOnboardingSeed } from 'shared/actions/ui';
import { VALID_SEED_REGEX, MAX_SEED_LENGTH } from 'shared/libs/iota/utils';
import { generateAlert } from 'shared/actions/alerts';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Modal from 'react-native-modal';
import FlagSecure from 'react-native-flag-secure-android';
import WithUserActivity from 'ui/components/UserActivity';
import CustomTextInput from 'ui/components/CustomTextInput';
import InfoBox from 'ui/components/InfoBox';
import StatefulDropdownAlert from 'ui/components/StatefulDropdownAlert';
import QRScannerComponent from 'ui/components/QrScanner';
import OnboardingButtons from 'ui/components/OnboardingButtons';
import SeedVaultImport from 'ui/components/SeedVaultImportComponent';
import PasswordValidation from 'ui/components/PasswordValidationModal';
import { width, height } from 'libs/dimensions';
import { Icon } from 'ui/theme/icons.js';
import { isAndroid } from 'libs/device';
import GENERAL from 'ui/theme/general';
import Header from 'ui/components/Header';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

console.ignoredYellowBox = ['Native TextInput']; // eslint-disable-line no-console

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 1,
        paddingTop: height / 16,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    midContainer: {
        flex: 3,
        alignItems: 'center',
        width,
        justifyContent: 'flex-start',
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
        backgroundColor: 'transparent',
    },
    warningText: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: GENERAL.fontSize3,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
});

/** Enter seed component */
class EnterSeed extends React.Component {
    static propTypes = {
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        setOnboardingSeed: PropTypes.func.isRequired,
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** Determines if the application is minimised */
        minimised: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            seed: '',
            isModalVisible: false,
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('EnterSeed');
        if (isAndroid) {
            FlagSecure.activate();
        }
    }

    componentWillUnmount() {
        if (isAndroid) {
            FlagSecure.deactivate();
        }
    }

    /**
     * Validate seed
     */
    onDonePress() {
        const { t, theme } = this.props;
        const { seed } = this.state;
        if (!seed.match(VALID_SEED_REGEX) && seed.length === MAX_SEED_LENGTH) {
            this.props.generateAlert('error', t('invalidCharacters'), t('invalidCharactersExplanation'));
        } else if (seed.length < MAX_SEED_LENGTH) {
            this.props.generateAlert(
                'error',
                t('seedTooShort'),
                t('seedTooShortExplanation', { maxLength: MAX_SEED_LENGTH, currentLength: seed.length }),
            );
        } else if (seed.length === MAX_SEED_LENGTH) {
            if (isAndroid) {
                FlagSecure.deactivate();
            }
            this.props.setOnboardingSeed(seed, true);
            this.props.navigator.push({
                screen: 'setAccountName',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    drawUnderStatusBar: true,
                    topBarElevationShadowEnabled: false,
                    statusBarColor: theme.body.bg,
                    screenBackgroundColor: theme.body.bg,
                },
                animated: false,
            });
        }
    }

    /**
     * Navigates back to the previous active screen in navigation stack
     * @method onBackPress
     */
    onBackPress() {
        this.props.navigator.pop({
            animated: false,
        });
    }

    /**
     * Displays QR scanner modal
     * @method onQRPress
     */
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
        } else if (dataString.length !== MAX_SEED_LENGTH) {
            this.props.generateAlert(
                'error',
                dataString.length > MAX_SEED_LENGTH ? t('seedTooLong') : t('seedTooShort'),
                t('seedTooShortExplanation', { maxLength: MAX_SEED_LENGTH, currentLength: dataString.length }),
            );
        } else {
            this.props.generateAlert('error', t('invalidCharacters'), t('invalidCharactersExplanation'));
        }
        this.hideModal();
    }

    showModal = (modalContent) => this.setState({ modalContent, isModalVisible: true });

    hideModal = () => this.setState({ isModalVisible: false });

    handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            Keyboard.dismiss();
        }
    };

    renderModalContent = (modalContent) => {
        const { theme, theme: { body, primary } } = this.props;
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
            case 'passwordValidation':
                content = (
                    <PasswordValidation
                        validatePassword={(password) => this.SeedVaultImport.validatePassword(password)}
                        hideModal={() => this.hideModal()}
                        theme={theme}
                    />
                );
                break;
        }
        return content;
    };

    render() {
        const { seed, modalContent, isModalVisible } = this.state;
        const { t, theme, minimised } = this.props;

        return (
            <TouchableWithoutFeedback style={{ flex: 0.8 }} onPress={Keyboard.dismiss} accessible={false}>
                <View style={[styles.container, { backgroundColor: theme.body.bg }]}>
                    {!minimised && (
                        <View>
                            <StatusBar barStyle="light-content" backgroundColor={theme.body.bg} />
                            <View style={styles.topContainer}>
                                <Icon name="iota" size={width / 8} color={theme.body.color} />
                                <View style={{ flex: 0.7 }} />
                                <Header textColor={theme.body.color}>{t('seedReentry:enterYourSeed')}</Header>
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
                                    theme={theme}
                                    autoCapitalize="characters"
                                    autoCorrect={false}
                                    enablesReturnKeyAutomatically
                                    returnKeyType="done"
                                    onSubmitEditing={() => this.onDonePress()}
                                    maxLength={MAX_SEED_LENGTH}
                                    value={seed}
                                    widget="qr"
                                    onQRPress={() => this.onQRPress()}
                                    testID="enterSeed-seedbox"
                                    seed={seed}
                                />
                                <View style={{ flex: 0.4 }} />
                                <SeedVaultImport
                                    openPasswordValidationModal={() => this.showModal('passwordValidation')}
                                    onSeedImport={(seed) => {
                                        this.setState({ seed });
                                        this.hideModal();
                                    }}
                                    onRef={(ref) => {
                                        this.SeedVaultImport = ref;
                                    }}
                                />
                                <View style={{ flex: 0.4 }} />
                                <InfoBox
                                    body={theme.body}
                                    text={
                                        <View>
                                            <Text style={[styles.infoText, { color: theme.body.color }]}>
                                                {t('seedExplanation', { maxLength: MAX_SEED_LENGTH })}
                                            </Text>
                                            <Text style={[styles.warningText, { color: theme.body.color }]}>
                                                {'\n'}
                                                {t('neverShare')}
                                            </Text>
                                        </View>
                                    }
                                />
                                <View style={{ flex: 0.7 }} />
                            </View>
                            <View style={styles.bottomContainer}>
                                <OnboardingButtons
                                    onLeftButtonPress={() => this.onBackPress()}
                                    onRightButtonPress={() => this.onDonePress()}
                                    leftButtonText={t('global:goBack')}
                                    rightButtonText={t('global:continue')}
                                    leftButtonTestID="enterSeed-back"
                                    rightButtonTestID="enterSeed-next"
                                />
                            </View>
                            {!isModalVisible && (
                                <StatefulDropdownAlert textColor="white" backgroundColor={theme.body.bg} />
                            )}
                            <Modal
                                animationIn={isAndroid ? 'bounceInUp' : 'zoomIn'}
                                animationOut={isAndroid ? 'bounceOut' : 'zoomOut'}
                                animationInTiming={isAndroid ? 1000 : 300}
                                animationOutTiming={200}
                                backdropTransitionInTiming={isAndroid ? 500 : 300}
                                backdropTransitionOutTiming={200}
                                backdropColor={theme.body.bg}
                                backdropOpacity={0.9}
                                style={{ height, width, justifyContent: 'center', alignItems: 'center', margin: 0 }}
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
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
    minimised: state.ui.minimised,
});

const mapDispatchToProps = {
    setOnboardingSeed,
    generateAlert,
};

export default WithUserActivity()(
    translate(['enterSeed', 'global'])(connect(mapStateToProps, mapDispatchToProps)(EnterSeed)),
);
