import values from 'lodash/values';
import isEqual from 'lodash/isEqual';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Animated, Text, View, StyleSheet, Keyboard, Easing } from 'react-native';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { generateAlert } from 'shared-modules/actions/alerts';
import { getSelectedAccountName, getSelectedAccountMeta } from 'shared-modules/selectors/accounts';
import timer from 'react-native-timer';
import Share from 'react-native-share';
import nodejs from 'nodejs-mobile-react-native';
import RNFetchBlob from 'rn-fetch-blob';
import { Styling } from 'ui/theme/general';
import { hash } from 'libs/keychain';
import SeedStore from 'libs/SeedStore';
import { width, height } from 'libs/dimensions';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { isAndroid, getAndroidFileSystemPermissions } from 'libs/device';
import { removeNonAlphaNumeric } from 'shared-modules/libs/utils';
import { tritsToChars } from 'shared-modules/libs/iota/converter';
import { moment } from 'shared-modules/libs/exports';
import { UInt8ToString } from 'libs/crypto';
import InfoBox from './InfoBox';
import Button from './Button';
import CustomTextInput from './CustomTextInput';
import PasswordFields from './PasswordFields';

const steps = [
    'isValidatingWalletPassword',
    'isViewingGeneralInfo',
    'isSettingPassword',
    'isExporting',
    'isSelectingSaveMethodAndroid',
];

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: width * steps.length,
    },
    viewContainer: {
        width,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize4,
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
    infoBoxText: {
        color: 'white',
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
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
        seed: PropTypes.string,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** Name for selected account */
        selectedAccountName: PropTypes.string,
        /** Type for selected account */
        selectedAccountMeta: PropTypes.object.isRequired,
        /** Returns to page before starting the Seed Vault Export process */
        goBack: PropTypes.func.isRequired,
        /** Current step of the Seed Vault Export process */
        step: PropTypes.string.isRequired,
        /** Sets the current step of the Seed Vault Export process */
        setProgressStep: PropTypes.func.isRequired,
        /** Callback function returning SeedVaultExportComponent instance as an argument */
        /** @param {object} instance - SeedVaultExportComponent instance
         */
        onRef: PropTypes.func.isRequired,
        /** Determines whether user needs to enter wallet password */
        isAuthenticated: PropTypes.bool.isRequired,
        /** Triggered when user enters the correct wallet password */
        setAuthenticated: PropTypes.func,
    };

    static defaultProps = {
        seed: '',
    };

    /**
     * Gets seed vault file path
     *
     * @method getPath
     *
     * @param {string} prefix
     *
     * @returns {string}
     */
    static getPath(prefix) {
        return `${
            isAndroid ? RNFetchBlob.fs.dirs.DownloadDir : RNFetchBlob.fs.dirs.CacheDir
        }/${prefix}-${moment().format('YYYYMMDD-HHmm')}.kdbx`;
    }

    constructor(props) {
        super(props);
        this.state = {
            currentPassword: null,
            password: null,
            reentry: null,
            path: '',
            saveToDownloadFolder: false,
            seed: props.seed,
        };
    }

    componentWillMount() {
        const { isAuthenticated, onRef } = this.props;
        onRef(this);
        this.animatedValue = new Animated.Value(isAuthenticated ? width : width * 2);
        nodejs.start('main.js');
        nodejs.channel.addListener(
            'message',
            (vault) => {
                this.onGenerateVault(vault);
            },
            this,
        );
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
        nodejs.channel.removeAllListeners();
        if (this.state.path !== '' && !this.state.saveToDownloadFolder) {
            RNFetchBlob.fs.unlink(this.state.path);
        }
        delete this.state.currentPassword;
        delete this.state.password;
        delete this.state.reentry;
        delete this.state.seed;
    }

    /**
     * Creates SeedVault file and opens share dialog for that file
     *
     * @method onGenerateVault
     * @param {string} Vault - Seed vault Uint8Array as string
     */
    async onGenerateVault(vault) {
        if (isAndroid) {
            await getAndroidFileSystemPermissions();
        }
        const { t, selectedAccountName } = this.props;

        const path = SeedVaultExportComponent.getPath(removeNonAlphaNumeric(selectedAccountName, 'SeedVault').trim());

        this.setState({ path });

        RNFetchBlob.fs.exists(path).then((fileExists) => {
            if (fileExists) {
                RNFetchBlob.fs.unlink(path);
            }
            RNFetchBlob.fs
                .createFile(path, values(vault), 'ascii')
                .then(() => {
                    if (this.state.saveToDownloadFolder) {
                        return this.onExportSuccess();
                    }
                    this.share(path);
                })
                .catch(() =>
                    this.props.generateAlert(
                        'error',
                        t('global:somethingWentWrong'),
                        t('global:somethingWentWrongTryAgain'),
                    ),
                );
        });
    }

    /**
     * Initiates screen transition animation or password check, depending on user step
     *
     * @method onNextPress
     */
    onNextPress() {
        const { step } = this.props;
        Keyboard.dismiss();
        if (step === 'isValidatingWalletPassword') {
            return this.validateWalletPassword();
        } else if (step === 'isViewingGeneralInfo') {
            return this.navigateToStep('isSettingPassword');
        } else if (step === 'isExporting') {
            return this.navigateToStep('isSelectingSaveMethodAndroid');
        }
        this.passwordFields.checkPassword();
    }

    /**
     * Deletes SeedVault file from cache memory
     *
     * @method onExportSuccess
     */
    onExportSuccess() {
        const { t } = this.props;
        if (isAndroid) {
            this.props.goBack();
            return timer.setTimeout(
                'timeout',
                () => this.props.generateAlert('success', t('exportSuccess'), t('exportSuccessExplanation')),
                300,
            );
        }
        RNFetchBlob.fs
            .unlink(this.state.path)
            .then(() => {
                this.props.goBack();
                timer.setTimeout(
                    'timeout',
                    () => this.props.generateAlert('success', t('exportSuccess'), t('exportSuccessExplanation')),
                    300,
                );
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
     * Sends message to nodejs thread to generate SeedVault file
     *
     * @method onExportPress
     */
    onExportPress() {
        // FIXME: Password should be UInt8, not string
        return nodejs.channel.send(
            'export:' + tritsToChars(this.state.seed) + ':' + UInt8ToString(this.state.password),
        );
    }

    /**
     * Initiates screen transition animation or navigates back to SeedBackupOptions, depending on user step
     *
     * @method onBackPress
     */
    onBackPress() {
        const { step } = this.props;
        if (step === 'isSettingPassword') {
            return this.navigateToStep('isViewingGeneralInfo');
        } else if (step === 'isExporting') {
            return this.navigateToStep('isSettingPassword');
        } else if (step === 'isSelectingSaveMethodAndroid') {
            return this.navigateToStep('isExporting');
        }
        this.props.goBack();
    }

    share(path) {
        Share.open({
            url: isAndroid ? 'file://' + path : path,
            type: 'application/octet-stream',
        })
            .then(() => {
                if (!isAndroid) {
                    this.onExportSuccess(path);
                }
            })
            .catch(() => RNFetchBlob.fs.unlink(path));
    }

    /**
     * Validates the user's wallet password
     *
     * @method validateWalletPassword
     */
    async validateWalletPassword() {
        const { t, selectedAccountName, selectedAccountMeta } = this.props;
        const { currentPassword } = this.state;
        if (!currentPassword) {
            this.props.generateAlert('error', t('login:emptyPassword'), t('login:emptyPasswordExplanation'));
        } else {
            const enteredPasswordHash = await hash(currentPassword);
            if (isEqual(enteredPasswordHash, global.passwordHash)) {
                const seedStore = await new SeedStore[selectedAccountMeta.type](
                    enteredPasswordHash,
                    selectedAccountName,
                );
                this.setState({ seed: await seedStore.getSeed() });
                this.props.setAuthenticated(true);
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
        const stepIndex = steps.indexOf(nextStep);
        const animatedValue = [2, 1, 0, -1, -2];
        Animated.timing(this.animatedValue, {
            toValue: animatedValue[stepIndex] * width,
            duration: 500,
            easing: Easing.bezier(0.25, 1, 0.25, 1),
        }).start();
        this.props.setProgressStep(nextStep);
    }

    render() {
        const { t, theme, isAuthenticated } = this.props;
        const { currentPassword, password, reentry } = this.state;
        const textColor = { color: theme.body.color };

        return (
            <Animated.View style={[styles.container, { transform: [{ translateX: this.animatedValue }] }]}>
                <View style={[styles.viewContainer, isAuthenticated && { opacity: 0 }]}>
                    <Text style={[styles.infoText, textColor, { marginBottom: height / 15 }]}>
                        {t('login:enterPassword')}
                    </Text>
                    <CustomTextInput
                        label={t('password')}
                        onValidTextChange={(currentPassword) => this.setState({ currentPassword })}
                        containerStyle={{ width: Styling.contentWidth }}
                        autoCapitalize="none"
                        autoCorrect={false}
                        enablesReturnKeyAutomatically
                        returnKeyType="done"
                        secureTextEntry
                        onSubmitEditing={() => this.onNextPress()}
                        theme={theme}
                        value={currentPassword}
                        isPasswordInput
                    />
                </View>
                <View style={styles.viewContainer}>
                    <InfoBox>
                        <Text style={[styles.infoBoxText, textColor]}>{t('seedVaultExplanation')}</Text>
                    </InfoBox>
                </View>
                <View style={styles.viewContainer}>
                    <InfoBox containerStyle={{ marginBottom: height / 30 }}>
                        <Text style={[styles.infoBoxText, textColor]}>{t('seedVaultKeyExplanation')}</Text>
                    </InfoBox>
                    <PasswordFields
                        onRef={(ref) => {
                            this.passwordFields = ref;
                        }}
                        onAcceptPassword={() => this.navigateToStep('isExporting')}
                        passwordLabel={t('twoFA:key')}
                        reentryLabel={t('retypeKey')}
                        password={password}
                        reentry={reentry}
                        setPassword={(password) => this.setState({ password })}
                        setReentry={(reentry) => this.setState({ reentry })}
                    />
                </View>
                <View style={styles.viewContainer}>
                    <InfoBox>
                        <Text style={[styles.infoBoxText, textColor]}>{t('seedVaultWarning')}</Text>
                    </InfoBox>
                </View>
                <View style={styles.viewContainer}>
                    <View>
                        <Button
                            onPress={() => {
                                this.setState({ saveToDownloadFolder: true });
                                this.onExportPress();
                            }}
                            style={{
                                wrapper: {
                                    width: width / 1.36,
                                    height: height / 13,
                                    borderRadius: height / 90,
                                    backgroundColor: theme.secondary.color,
                                    marginBottom: height / 20,
                                },
                                children: { color: theme.primary.body },
                            }}
                        >
                            {t('saveToDownloadFolder')}
                        </Button>
                        <Button
                            onPress={() => {
                                this.setState({ saveToDownloadFolder: false });
                                this.onExportPress();
                            }}
                            style={{
                                wrapper: {
                                    width: width / 1.36,
                                    height: height / 13,
                                    borderRadius: height / 90,
                                    backgroundColor: theme.secondary.color,
                                },
                                children: { color: theme.primary.body },
                            }}
                        >
                            {t('global:share')}
                        </Button>
                    </View>
                </View>
            </Animated.View>
        );
    }
}

const mapStateToProps = (state) => ({
    selectedAccountName: getSelectedAccountName(state),
    selectedAccountMeta: getSelectedAccountMeta(state),
    theme: getThemeFromState(state),
    minimised: state.ui.minimised,
});

const mapDispatchToProps = {
    generateAlert,
};

export default withNamespaces(['seedVault', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(SeedVaultExportComponent),
);
