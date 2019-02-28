import size from 'lodash/size';
import React from 'react';
import { withNamespaces } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { navigator } from 'libs/navigation';
import { toggleModalActivity, setDoNotMinimise } from 'shared-modules/actions/ui';
import { setAccountInfoDuringSetup } from 'shared-modules/actions/accounts';
import { VALID_SEED_REGEX, MAX_SEED_TRITS, MAX_SEED_LENGTH } from 'shared-modules/libs/iota/utils';
import { generateAlert } from 'shared-modules/actions/alerts';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FlagSecure from 'react-native-flag-secure-android';
import { getThemeFromState } from 'shared-modules/selectors/global';
import WithUserActivity from 'ui/components/UserActivity';
import CustomTextInput from 'ui/components/CustomTextInput';
import InfoBox from 'ui/components/InfoBox';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import SeedVaultImport from 'ui/components/SeedVaultImportComponent';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import { width } from 'libs/dimensions';
import { isAndroid } from 'libs/device';
import { Styling } from 'ui/theme/general';
import Header from 'ui/components/Header';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import { trytesToTrits } from 'shared-modules/libs/iota/converter';

console.ignoredYellowBox = ['Native TextInput']; // eslint-disable-line no-console

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 1.4,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    midContainer: {
        flex: 2.6,
        alignItems: 'center',
        width,
        justifyContent: 'space-between',
    },
    bottomContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    warningText: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    seedVaultImportContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'center',
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
        theme: PropTypes.object.isRequired,
        /** Determines if the application is minimised */
        minimised: PropTypes.bool.isRequired,
        /** @ignore */
        toggleModalActivity: PropTypes.func.isRequired,
        /** @ignore */
        setAccountInfoDuringSetup: PropTypes.func.isRequired,
        /** @ignore */
        setDoNotMinimise: PropTypes.func.isRequired,
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
        delete this.state.seed;
    }

    /**
     * Validate seed
     */
    onDonePress() {
        const { t } = this.props;
        const { seed } = this.state;
        if (seed === null || seed.length !== MAX_SEED_TRITS) {
            this.props.generateAlert(
                'error',
                seed && size(seed) > MAX_SEED_TRITS ? t('seedTooLong') : t('seedTooShort'),
                t('seedTooShortExplanation', { maxLength: MAX_SEED_LENGTH, currentLength: seed ? size(seed) / 3 : 0 }),
            );
        } else {
            if (isAndroid) {
                FlagSecure.deactivate();
            }
            global.onboardingSeed = seed;
            // Since this seed was not generated in Trinity, mark "usedExistingSeed" as true.
            this.props.setAccountInfoDuringSetup({ usedExistingSeed: true });
            navigator.push('setAccountName');
        }
    }

    /**
     * Navigates back to the previous active screen in navigation stack
     * @method onBackPress
     */
    onBackPress() {
        navigator.pop(this.props.componentId);
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
            this.setState({ seed: trytesToTrits(data) });
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
                    onMount: () => this.props.setDoNotMinimise(true),
                    onUnmount: () => this.props.setDoNotMinimise(false),
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
        const { t, theme, minimised } = this.props;

        return (
            <TouchableWithoutFeedback style={{ flex: 0.8 }} onPress={Keyboard.dismiss} accessible={false}>
                <View style={[styles.container, { backgroundColor: theme.body.bg }]}>
                    {!minimised && (
                        <View>
                            <View style={styles.topContainer}>
                                <AnimatedComponent
                                    animationInType={['slideInRight', 'fadeIn']}
                                    animationOutType={['slideOutLeft', 'fadeOut']}
                                    delay={400}
                                >
                                    <Header textColor={theme.body.color}>{t('seedReentry:enterYourSeed')}</Header>
                                </AnimatedComponent>
                            </View>
                            <View style={styles.midContainer}>
                                <AnimatedComponent
                                    animationInType={['slideInRight', 'fadeIn']}
                                    animationOutType={['slideOutLeft', 'fadeOut']}
                                    delay={300}
                                >
                                    <InfoBox>
                                        <Text style={[styles.infoText, { color: theme.body.color }]}>
                                            {t('seedExplanation', { maxLength: MAX_SEED_LENGTH })}
                                        </Text>
                                        <Text style={[styles.warningText, { color: theme.body.color }]}>
                                            {'\n'}
                                            {t('neverShare')}
                                        </Text>
                                    </InfoBox>
                                </AnimatedComponent>
                                <View style={{ flex: 0.5 }} />
                                <AnimatedComponent
                                    animationInType={['slideInRight', 'fadeIn']}
                                    animationOutType={['slideOutLeft', 'fadeOut']}
                                    delay={200}
                                >
                                    <CustomTextInput
                                        label={t('global:seed')}
                                        onValidTextChange={(seed) => this.setState({ seed })}
                                        theme={theme}
                                        autoCapitalize="characters"
                                        autoCorrect={false}
                                        enablesReturnKeyAutomatically
                                        returnKeyType="done"
                                        onSubmitEditing={() => this.onDonePress()}
                                        maxLength={MAX_SEED_LENGTH}
                                        value={this.state.seed}
                                        widget="qr"
                                        onQRPress={() => this.onQRPress()}
                                        testID="enterSeed-seedbox"
                                        isSeedInput
                                    />
                                </AnimatedComponent>
                                <View style={{ flex: 0.1 }} />
                                <AnimatedComponent
                                    animationInType={['slideInRight', 'fadeIn']}
                                    animationOutType={['slideOutLeft', 'fadeOut']}
                                    delay={100}
                                    style={styles.seedVaultImportContainer}
                                >
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
                                </AnimatedComponent>
                                <View style={{ flex: 0.6 }} />
                            </View>
                            <View style={styles.bottomContainer}>
                                <AnimatedComponent
                                    animationInType={['fadeIn']}
                                    animationOutType={['fadeOut']}
                                    delay={0}
                                >
                                    <DualFooterButtons
                                        onLeftButtonPress={() => this.onBackPress()}
                                        onRightButtonPress={() => this.onDonePress()}
                                        leftButtonText={t('global:goBack')}
                                        rightButtonText={t('global:continue')}
                                        leftButtonTestID="enterSeed-back"
                                        rightButtonTestID="enterSeed-next"
                                    />
                                </AnimatedComponent>
                            </View>
                        </View>
                    )}
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
    minimised: state.ui.minimised,
});

const mapDispatchToProps = {
    generateAlert,
    toggleModalActivity,
    setAccountInfoDuringSetup,
    setDoNotMinimise
};

export default WithUserActivity()(
    withNamespaces(['enterSeed', 'global'])(connect(mapStateToProps, mapDispatchToProps)(EnterSeed)),
);
