import isEqual from 'lodash/isEqual';
import size from 'lodash/size';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';
import { Keyboard, StyleSheet, View, Text, TouchableWithoutFeedback } from 'react-native';
import { connect } from 'react-redux';
import { MAX_SEED_LENGTH, VALID_SEED_REGEX, MAX_SEED_TRITS } from 'shared-modules/libs/iota/utils';
import { navigator } from 'libs/navigation';
import { generateAlert } from 'shared-modules/actions/alerts';
import { toggleModalActivity, setDoNotMinimise } from 'shared-modules/actions/ui';
import FlagSecure from 'react-native-flag-secure-android';
import { getThemeFromState } from 'shared-modules/selectors/global';
import WithUserActivity from 'ui/components/UserActivity';
import { width, height } from 'libs/dimensions';
import CustomTextInput from 'ui/components/CustomTextInput';
import { Styling } from 'ui/theme/general';
import InfoBox from 'ui/components/InfoBox';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import SeedVaultImport from 'ui/components/SeedVaultImportComponent';
import Header from 'ui/components/Header';
import { isAndroid } from 'libs/device';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import { trytesToTrits } from 'shared-modules/libs/iota/converter';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 1.4,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    midContainer: {
        flex: 2.6,
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
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    warningText: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize3,
        paddingTop: height / 60,
        textAlign: 'center',
    },
    seedVaultImportContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

/** Seed Reentry component */
class SeedReentry extends Component {
    static propTypes = {
        /** Component ID */
        componentId: PropTypes.string.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        minimised: PropTypes.bool.isRequired,
        /** @ignore */
        toggleModalActivity: PropTypes.func.isRequired,
        /** @ignore */
        setDoNotMinimise: PropTypes.func.isRequired,
    };

    constructor() {
        super();
        this.state = {
            reenteredSeed: null,
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
        delete this.state.reenteredSeed;
    }

    /**
     * Navigates to set account name screen
     * @method onDonePress
     */
    onDonePress() {
        const { t } = this.props;
        const { reenteredSeed } = this.state;
        if (global.onboardingSeed && isEqual(reenteredSeed, global.onboardingSeed)) {
            if (isAndroid) {
                FlagSecure.deactivate();
            }
            navigator.push('setAccountName');
            delete this.state.reenteredSeed;
        } else if (size(reenteredSeed) === MAX_SEED_TRITS) {
            this.props.generateAlert('error', t('incorrectSeed'), t('incorrectSeedExplanation'));
        } else {
            this.props.generateAlert(
                'error',
                t('useExistingSeed:incorrectFormat'),
                t('useExistingSeed:validSeedExplanation'),
            );
        }
    }

    /**
     * Pops out the active screen from the navigation stack
     * @method onBackPress
     */
    onBackPress() {
        navigator.pop(this.props.componentId);
    }

    /**
     * Wrapper method to activate/show QR scan modal
     * @method onQRPress
     */
    onQRPress() {
        this.showModal('qrScanner');
    }

    /**
     * Parse and validate QR data
     * @method onQRRead
     *
     * @param {String} data QR data
     */
    onQRRead(data) {
        const dataString = data.toString();
        const { t } = this.props;
        if (dataString.length === MAX_SEED_LENGTH && dataString.match(VALID_SEED_REGEX)) {
            this.setState({ reenteredSeed: trytesToTrits(data) });
        } else {
            this.props.generateAlert(
                'error',
                t('useExistingSeed:incorrectFormat'),
                t('useExistingSeed:validSeedExplanation'),
            );
        }
        this.props.toggleModalActivity();
    }

    showModal = (modalContent) => {
        const { theme } = this.props;
        switch (modalContent) {
            case 'qrScanner':
                return this.props.toggleModalActivity(modalContent, {
                    theme,
                    hideModal: () => this.props.toggleModalActivity(),
                    onQRRead: (data) => this.onQRRead(data),
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
        const textColor = { color: theme.body.color };

        return (
            <View style={[styles.container, { backgroundColor: theme.body.bg }]}>
                {!minimised && (
                    <View>
                        <TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
                            <View>
                                <View style={styles.topContainer}>
                                    <AnimatedComponent
                                        animationInType={['slideInRight', 'fadeIn']}
                                        animationOutType={['slideOutLeft', 'fadeOut']}
                                        delay={400}
                                    >
                                        <Header textColor={theme.body.color}>{t('pleaseConfirmYourSeed')}</Header>
                                    </AnimatedComponent>
                                </View>
                                <View style={styles.midContainer}>
                                    <AnimatedComponent
                                        animationInType={['slideInRight', 'fadeIn']}
                                        animationOutType={['slideOutLeft', 'fadeOut']}
                                        delay={300}
                                    >
                                        <InfoBox>
                                            <Text style={[styles.infoTextBottom, textColor]}>
                                                {t('ifYouHaveNotSaved')}
                                            </Text>
                                            <Text style={[styles.warningText, textColor]}>
                                                {t('trinityWillNeverAskToReenter')}
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
                                            onValidTextChange={(text) => this.setState({ reenteredSeed: text })}
                                            maxLength={MAX_SEED_LENGTH}
                                            autoCapitalize="characters"
                                            autoCorrect={false}
                                            enablesReturnKeyAutomatically
                                            returnKeyType="done"
                                            onSubmitEditing={() => this.onDonePress()}
                                            theme={theme}
                                            value={this.state.reenteredSeed}
                                            widget="qr"
                                            onQRPress={() => this.onQRPress()}
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
                                                this.setState({ reenteredSeed: seed });
                                                this.props.toggleModalActivity();
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
                                            leftButtonText={t(':goBack')}
                                            rightButtonText={t('global:done')}
                                        />
                                    </AnimatedComponent>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                )}
            </View>
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
    setDoNotMinimise
};

export default WithUserActivity()(
    withNamespaces(['seedReentry', 'global'])(connect(mapStateToProps, mapDispatchToProps)(SeedReentry)),
);
