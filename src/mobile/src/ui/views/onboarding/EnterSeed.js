import React from 'react';
import { withNamespaces } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { setOnboardingSeed, toggleModalActivity } from 'shared-modules/actions/ui';
import { VALID_SEED_REGEX, MAX_SEED_LENGTH } from 'shared-modules/libs/iota/utils';
import { generateAlert } from 'shared-modules/actions/alerts';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FlagSecure from 'react-native-flag-secure-android';
import WithUserActivity from 'ui/components/UserActivity';
import CustomTextInput from 'ui/components/CustomTextInput';
import InfoBox from 'ui/components/InfoBox';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import SeedVaultImport from 'ui/components/SeedVaultImportComponent';
import { width, height } from 'libs/dimensions';
import { Icon } from 'ui/theme/icons';
import { isAndroid, isIPhone11 } from 'libs/device';
import { Styling } from 'ui/theme/general';
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
        fontSize: Styling.fontSize3,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    warningText: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize3,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
});

/** Enter seed component */
class EnterSeed extends React.Component {
    static propTypes = {
        /** Component ID */
        componentId: PropTypes.string.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        setOnboardingSeed: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** Determines if the application is minimised */
        minimised: PropTypes.bool.isRequired,
        /** @ignore */
        toggleModalActivity: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            seed: '',
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
        const { t, theme: { body } } = this.props;
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
            Navigation.push('appStack', {
                component: {
                    name: 'setAccountName',
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
    }

    /**
     * Navigates back to the previous active screen in navigation stack
     * @method onBackPress
     */
    onBackPress() {
        Navigation.pop(this.props.componentId);
    }

    /**
     * Displays QR scanner modal
     * @method onQRPress
     */
    onQRPress() {
        this.showModal('qrScanner');
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

    hideModal = () => this.props.toggleModalActivity();

    showModal = (modalContent) => {
        const { theme } = this.props;
        switch (modalContent) {
            case 'qrScanner':
                return this.props.toggleModalActivity(modalContent, {
                    theme,
                    onQRRead: (data) => this.onQRRead(data),
                    hideModal: () => this.props.toggleModalActivity(),
                });
            case 'passwordValidation':
                return this.props.toggleModalActivity(modalContent, {
                    validatePassword: (password) => this.SeedVaultImport.validatePassword(password),
                    hideModal: () => this.props.toggleModalActivity(),
                    theme,
                });
        }
    };

    render() {
        const { seed } = this.state;
        const { t, theme, minimised } = this.props;

        return (
            <TouchableWithoutFeedback style={{ flex: 0.8 }} onPress={Keyboard.dismiss} accessible={false}>
                <View style={[styles.container, { backgroundColor: theme.body.bg }]}>
                    {!minimised && (
                        <View>
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
                                    containerStyle={{ width: Styling.contentWidth }}
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
                                {!isIPhone11 && (
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
                                )}
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
                                <DualFooterButtons
                                    onLeftButtonPress={() => this.onBackPress()}
                                    onRightButtonPress={() => this.onDonePress()}
                                    leftButtonText={t('global:goBack')}
                                    rightButtonText={t('global:continue')}
                                    leftButtonTestID="enterSeed-back"
                                    rightButtonTestID="enterSeed-next"
                                />
                            </View>
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
    toggleModalActivity,
};

export default WithUserActivity()(
    withNamespaces(['enterSeed', 'global'])(connect(mapStateToProps, mapDispatchToProps)(EnterSeed)),
);
