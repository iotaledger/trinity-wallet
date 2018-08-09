import map from 'lodash/map';
import isEqual from 'lodash/isEqual';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Animated, Text, View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { getSelectedAccountName } from 'iota-wallet-shared-modules/selectors/accounts';
import Share from 'react-native-share';
import nodejs from 'nodejs-mobile-react-native';
import RNFetchBlob from 'rn-fetch-blob';
import CustomTextInput from './CustomTextInput';
import GENERAL from '../theme/general';
import PasswordFields from './PasswordFields';
import InfoBox from './InfoBox';
import { getPasswordHash, getSeedFromKeychain } from '../utils/keychain';
import { width, height } from '../utils/dimensions';

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: width * 5,
    },
    viewContainer: {
        width,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize4,
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
    infoBoxText: {
        color: 'white',
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
});

class SeedVaultExportComponent extends Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        seed: PropTypes.string.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        goBack: PropTypes.func.isRequired,
        /** @ignore */
        step: PropTypes.string.isRequired,
        /** @ignore */
        setProgressStep: PropTypes.func.isRequired,
        /** @ignore */
        onRef: PropTypes.func.isRequired,
        /** @ignore */
        isAuthenticated: PropTypes.bool.isRequired,
        /** @ignore */
        storedPasswordHash: PropTypes.object.isRequired,
        /** @ignore */
        setAuthenticated: PropTypes.func,
        /** @ignore */
        setSeed: PropTypes.func.isRequired,
    };

    constructor() {
        super();
        this.state = {
            password: '',
            reentry: '',
        };
    }

    componentWillMount() {
        const { isAuthenticated, onRef } = this.props;

        onRef(this);

        this.animatedValue = new Animated.Value(isAuthenticated ? width : width * 2);

        nodejs.start('main.js');
        nodejs.channel.addListener(
            'message',
            async (vault) => {
                this.onGenerateVault(vault);
            },
            this,
        );
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
        nodejs.channel.removeAllListeners();
    }

    /**
     * Creates SeedVault file and opens share dialog for that file
     *
     * @method onGenerateVault
     * @param {string} Vault - Seed vault Uint8Array as string
     */
    onGenerateVault(vault) {
        const { t } = this.props;
        const now = new Date();
        const path =
            RNFetchBlob.fs.dirs.CacheDir +
            `/trinity-${now
                .toISOString()
                .slice(0, 16)
                .replace(/[-:]/g, '')
                .replace('T', '-')}.kdbx`;
        const vaultParsed = map(vault.split(','), (num) => parseInt(num));
        RNFetchBlob.fs
            .createFile(path, vaultParsed, 'ascii')
            .then(() => {
                Share.open({
                    url: path,
                })
                    .then(() => this.onExportSuccess(path))
                    .catch(() => RNFetchBlob.fs.unlink(path));
            })
            .catch(() =>
                this.props.generateAlert(
                    'error',
                    t('global:somethingWentWrong'),
                    t('global:somethingWentWrongTryAgain'),
                ),
            );
    }

    /**
     * Initiates screen transition animation or password check, depending on user step
     *
     * @method onNextPress
     */
    onNextPress() {
        const { step } = this.props;
        if (step === 'isValidatingWalletPassword') {
            return this.validateWalletPassword();
        } else if (step === 'isViewingGeneralInfo') {
            return this.navigateToStep('isViewingPasswordInfo');
        } else if (step === 'isViewingPasswordInfo') {
            return this.navigateToStep('isSettingPassword');
        }
        this.PasswordFields.checkPassword();
    }

    /**
     * Deletes SeedVault file from cache memory
     *
     * @method onExportSuccess
     */
    onExportSuccess(path) {
        const { t } = this.props;
        RNFetchBlob.fs
            .unlink(path)
            .then(() => this.goBack())
            .catch(() =>
                this.props.generateAlert(
                    'error',
                    t('global:somethingWentWrong'),
                    t('global:somethingWentWrongTryAgain'),
                ),
            );
    }

    /**
     * Sends message to nodejs thread to generate SeedVault file
     *
     * @method onExportPress
     */
    onExportPress() {
        return nodejs.channel.send(this.props.seed + ':' + this.state.password);
    }

    /**
     * Initiates screen transition animation or navigates back to SeedBackupOptions, depending on user step
     *
     * @method onBackPress
     */
    onBackPress() {
        const { step } = this.props;
        if (step === 'isViewingPasswordInfo') {
            return this.navigateToStep('isViewingGeneralInfo');
        } else if (step === 'isSettingPassword') {
            return this.navigateToStep('isViewingPasswordInfo');
        } else if (step === 'isExporting') {
            return this.navigateToStep('isSettingPassword');
        }
        this.props.goBack();
    }

    /**
     * Validates the user's wallet password
     *
     * @method validateWalletPassword
     */
    async validateWalletPassword() {
        const { t, storedPasswordHash, selectedAccountName } = this.props;
        const { password } = this.state;
        if (!password) {
            this.props.generateAlert('error', t('login:emptyPassword'), t('login:emptyPasswordExplanation'));
        } else {
            const enteredPasswordHash = await getPasswordHash(password);
            if (isEqual(enteredPasswordHash, storedPasswordHash)) {
                const seed = await getSeedFromKeychain(enteredPasswordHash, selectedAccountName);
                this.props.setSeed(seed);
                this.props.setAuthenticated(true);
                this.setState({ password: '' });
                return this.navigateToStep('isViewingGeneralInfo');
            }
            this.props.generateAlert(
                'error',
                t('global:unrecognisedPassword'),
                t('global:unrecognisedPasswordExplanation'),
            );
        }
    }

    /**
     * Animates to specified progress step
     *
     * @method navigateToStep
     * @param {string} nextStep
     */
    navigateToStep(nextStep) {
        const steps = [
            'isValidatingWalletPassword',
            'isViewingGeneralInfo',
            'isViewingPasswordInfo',
            'isSettingPassword',
            'isExporting',
        ];
        const stepIndex = steps.indexOf(nextStep);
        const animatedValue = [2, 1, 0, -1, -2];
        Animated.spring(this.animatedValue, {
            toValue: animatedValue[stepIndex] * width,
            velocity: 3,
            tension: 2,
            friction: 8,
        }).start();
        this.props.setProgressStep(nextStep);
    }

    render() {
        const { t, theme } = this.props;
        const { password, reentry } = this.state;
        const textColor = { color: theme.body.color };

        return (
            <Animated.View style={[styles.container, { transform: [{ translateX: this.animatedValue }] }]}>
                <View style={styles.viewContainer}>
                    <Text style={[styles.infoText, textColor, { marginBottom: height / 15 }]}>
                        {t('login:enterPassword')}
                    </Text>
                    <CustomTextInput
                        label={t('password')}
                        onChangeText={(password) => this.setState({ password })}
                        containerStyle={{ width: width / 1.15 }}
                        autoCapitalize="none"
                        autoCorrect={false}
                        enablesReturnKeyAutomatically
                        returnKeyType="done"
                        secureTextEntry
                        onSubmitEditing={() => this.onNextPress()}
                        theme={theme}
                        value={password}
                    />
                </View>
                <View style={styles.viewContainer}>
                    <InfoBox
                        body={theme.body}
                        text={<Text style={[styles.infoBoxText, textColor]}>{t('seedVaultExplanation')}</Text>}
                    />
                </View>
                <View style={styles.viewContainer}>
                    <InfoBox
                        body={theme.body}
                        text={
                            <Text style={[styles.infoBoxText, textColor]}>
                                First we need to secure your SeedVault. Please choose a password to encrypt the file.
                                You will need this password to restore your seed from the SeedVault back up. Feel free
                                to use the same password you use for Trinity.
                            </Text>
                        }
                    />
                </View>
                <View style={styles.viewContainer}>
                    <PasswordFields
                        onRef={(ref) => {
                            this.PasswordFields = ref;
                        }}
                        onAcceptPassword={() => this.navigateToStep('isExporting')}
                        password={password}
                        reentry={reentry}
                        setPassword={(password) => this.setState({ password })}
                        setReentry={(reentry) => this.setState({ reentry })}
                    />
                </View>
                <View style={styles.viewContainer}>
                    <InfoBox
                        body={theme.body}
                        text={<Text style={[styles.infoBoxText, textColor]}>{t('seedVaultWarning')}</Text>}
                    />
                </View>
            </Animated.View>
        );
    }
}

const mapStateToProps = (state) => ({
    selectedAccountName: getSelectedAccountName(state),
    theme: state.settings.theme,
    minimised: state.ui.minimised,
    storedPasswordHash: state.wallet.password,
});

const mapDispatchToProps = {
    generateAlert,
};

export default translate(['seedVault', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(SeedVaultExportComponent),
);
