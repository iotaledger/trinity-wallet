import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';
import { Keyboard, StyleSheet, View, Text, TouchableWithoutFeedback } from 'react-native';
import { connect } from 'react-redux';
import { MAX_SEED_LENGTH, VALID_SEED_REGEX } from 'shared-modules/libs/iota/utils';
import { Navigation } from 'react-native-navigation';
import { generateAlert } from 'shared-modules/actions/alerts';
import { toggleModalActivity } from 'shared-modules/actions/ui';
import FlagSecure from 'react-native-flag-secure-android';
import WithUserActivity from 'ui/components/UserActivity';
import { width, height } from 'libs/dimensions';
import CustomTextInput from 'ui/components/CustomTextInput';
import { Styling } from 'ui/theme/general';
import InfoBox from 'ui/components/InfoBox';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import SeedVaultImport from 'ui/components/SeedVaultImportComponent';
import { Icon } from 'ui/theme/icons';
import Header from 'ui/components/Header';
import { isAndroid, isIPhone11 } from 'libs/device';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

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
        fontSize: Styling.fontSize3,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    warningText: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize3,
        paddingTop: height / 60,
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
        seed: PropTypes.string.isRequired,
        /** @ignore */
        minimised: PropTypes.bool.isRequired,
        /** @ignore */
        toggleModalActivity: PropTypes.func.isRequired,
    };

    constructor() {
        super();
        this.state = {
            seed: '',
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

    /**
     * Navigates to set account name screen
     * @method onDonePress
     */
    onDonePress() {
        const { t, seed, theme: { body } } = this.props;
        if (this.state.seed === seed) {
            if (isAndroid) {
                FlagSecure.deactivate();
            }
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
            this.setState({ seed: '' });
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

    /**
     * Pops out the active screen from the navigation stack
     * @method onBackPress
     */
    onBackPress() {
        Navigation.pop(this.props.componentId);
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
        this.props.toggleModalActivity();
    }

    showModal = (modalContent) => {
        const { theme } = this.props;
        switch (modalContent) {
            case 'qrScanner':
                return this.props.toggleModalActivity(modalContent, {
                    theme,
                    print: () => this.print(),
                    hideModal: () => this.props.toggleModalActivity(),
                    onQRRead: (data) => this.onQRRead(data),
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
        const textColor = { color: theme.body.color };

        return (
            <View style={[styles.container, { backgroundColor: theme.body.bg }]}>
                {!minimised && (
                    <View>
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
                                        containerStyle={{ width: Styling.contentWidth }}
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
                                        seed={seed}
                                    />
                                    {!isIPhone11 && (
                                        <SeedVaultImport
                                            openPasswordValidationModal={() => this.showModal('passwordValidation')}
                                            onSeedImport={(seed) => {
                                                this.setState({ seed });
                                                this.props.toggleModalActivity();
                                            }}
                                            onRef={(ref) => {
                                                this.SeedVaultImport = ref;
                                            }}
                                        />
                                    )}
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
                                    <DualFooterButtons
                                        onLeftButtonPress={() => this.onBackPress()}
                                        onRightButtonPress={() => this.onDonePress()}
                                        leftButtonText={t(':goBack')}
                                        rightButtonText={t('global:done')}
                                    />
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
    seed: state.wallet.seed,
    theme: state.settings.theme,
    minimised: state.ui.minimised,
});

const mapDispatchToProps = {
    generateAlert,
    toggleModalActivity,
};

export default WithUserActivity()(
    withNamespaces(['seedReentry', 'global'])(connect(mapStateToProps, mapDispatchToProps)(SeedReentry)),
);
