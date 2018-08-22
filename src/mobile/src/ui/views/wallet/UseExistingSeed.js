import trim from 'lodash/trim';
import isNull from 'lodash/isNull';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Clipboard } from 'react-native';
import Modal from 'react-native-modal';
import { MAX_SEED_LENGTH, VALID_SEED_REGEX } from 'shared/libs/iota/utils';
import { setSetting, setAdditionalAccountInfo } from 'shared/actions/wallet';
import { generateAlert } from 'shared/actions/alerts';
import { shouldPreventAction } from 'shared/selectors/global';
import { toggleModalActivity, setDoNotMinimise } from 'shared/actions/ui';
import timer from 'react-native-timer';
import { hasDuplicateAccountName, hasDuplicateSeed, getAllSeedsFromKeychain } from 'mobile/src/libs/keychain';
import SeedVaultImport from 'mobile/src/ui/components/SeedVaultImportComponent';
import PasswordValidation from 'mobile/src/ui/components/PasswordValidationModal';
import CustomTextInput from 'mobile/src/ui/components/CustomTextInput';
import QRScannerComponent from 'mobile/src/ui/components/QrScanner';
import { width, height } from 'mobile/src/libs/dimensions';
import { Icon } from 'mobile/src/ui/theme/icons.js';
import { isAndroid } from 'mobile/src/libs/device';
import GENERAL from 'mobile/src/ui/theme/general';
import { leaveNavigationBreadcrumb } from 'mobile/src/libs/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    bottomContainer: {
        flex: 1,
        paddingHorizontal: width / 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    topContainer: {
        flex: 11,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: height / 30,
    },
    title: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize4,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    titleTextLeft: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    titleTextRight: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
        marginRight: width / 20,
    },
    modal: {
        height,
        width,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
    },
});

/** Use Existing Seed component */
class UseExistingSeed extends Component {
    static propTypes = {
        /** @ignore */
        seedCount: PropTypes.number.isRequired,
        /** @ignore */
        accountNames: PropTypes.array.isRequired,
        /** @ignore */
        password: PropTypes.object.isRequired,
        /** Determines whether addition of new seed is allowed */
        shouldPreventAction: PropTypes.bool.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        setAdditionalAccountInfo: PropTypes.func.isRequired,
        /** @ignore */
        setSetting: PropTypes.func.isRequired,
        /** @ignore */
        isModalActive: PropTypes.bool.isRequired,
        /** @ignore */
        toggleModalActivity: PropTypes.func.isRequired,
        /** @ignore */
        setDoNotMinimise: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            seed: '',
            accountName: this.getDefaultAccountName(),
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('UseExistingSeed');
    }

    componentWillUnmount() {
        timer.clearTimeout('invalidSeedAlert');
    }

    /**
     * Displays QR scanner modal
     * @method onQRPress
     */
    onQRPress() {
        this.showModal('qr');
    }

    /**
     * Validates scanned QR data
     * Generates an alert if invalid data is scanned
     *
     * @method onQRRead
     * @param {string} data
     */
    onQRRead(data) {
        const { t } = this.props;
        const dataString = data.toString();
        this.hideModal();
        if (dataString.length === 81 && dataString.match(VALID_SEED_REGEX)) {
            this.setState({
                seed: data,
            });
        } else {
            timer.setTimeout(
                'invalidSeedAlert',
                () =>
                    this.props.generateAlert(
                        'error',
                        t('useExistingSeed:incorrectFormat'),
                        t('useExistingSeed:validSeedExplanation'),
                    ),
                500,
            );
        }
    }

    /**
     * Gets a default account name
     * @method getDefaultAccountName
     */
    getDefaultAccountName() {
        const { t } = this.props;
        if (this.props.seedCount === 0) {
            return t('global:mainWallet');
        } else if (this.props.seedCount === 1) {
            return t('global:secondWallet');
        } else if (this.props.seedCount === 2) {
            return t('global:thirdWallet');
        } else if (this.props.seedCount === 3) {
            return t('global:fourthWallet');
        } else if (this.props.seedCount === 4) {
            return t('global:fifthWallet');
        } else if (this.props.seedCount === 5) {
            return t('global:sixthWallet');
        } else if (this.props.seedCount === 6) {
            return t('global:otherWallet');
        }
        return '';
    }

    /**
     * Adds additional account information to store
     * Navigates to loading screen
     * @method fetchAccountInfo
     */
    fetchAccountInfo(seed, accountName) {
        const { theme: { body } } = this.props;

        this.props.setAdditionalAccountInfo({
            addingAdditionalAccount: true,
            additionalAccountName: accountName,
            seed,
            usedExistingSeed: true,
        });

        this.props.navigator.push({
            screen: 'loading',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                topBarElevationShadowEnabled: false,
                screenBackgroundColor: body.bg,
                drawUnderStatusBar: true,
                statusBarColor: body.bg,
            },
            animated: false,
            overrideBackPress: true,
        });
    }

    /**
     * Validates seed and dispatches an action to fetch associated information
     *
     * @method addExistingSeed
     * @param {string} seed
     * @param {string} accountName
     */
    addExistingSeed(seed, accountName) {
        const { t, accountNames, password, shouldPreventAction } = this.props;
        if (!seed.match(VALID_SEED_REGEX) && seed.length === MAX_SEED_LENGTH) {
            this.props.generateAlert(
                'error',
                t('addAdditionalSeed:seedInvalidChars'),
                t('addAdditionalSeed:seedInvalidCharsExplanation'),
            );
        } else if (seed.length < MAX_SEED_LENGTH) {
            this.props.generateAlert(
                'error',
                t('addAdditionalSeed:seedTooShort'),
                t('addAdditionalSeed:seedTooShortExplanation', {
                    maxLength: MAX_SEED_LENGTH,
                    currentLength: seed.length,
                }),
            );
        } else if (!(accountName.length > 0)) {
            this.props.generateAlert(
                'error',
                t('addAdditionalSeed:noNickname'),
                t('addAdditionalSeed:noNicknameExplanation'),
            );
        } else if (accountNames.includes(accountName)) {
            this.props.generateAlert(
                'error',
                t('addAdditionalSeed:nameInUse'),
                t('addAdditionalSeed:nameInUseExplanation'),
            );
        } else {
            if (shouldPreventAction) {
                return this.props.generateAlert('error', t('global:pleaseWait'), t('global:pleaseWaitExplanation'));
            }
            getAllSeedsFromKeychain(password)
                .then((seedInfo) => {
                    if (isNull(seedInfo)) {
                        return this.fetchAccountInfo(seed, accountName);
                    }
                    if (hasDuplicateAccountName(seedInfo, accountName)) {
                        return this.props.generateAlert(
                            'error',
                            t('addAdditionalSeed:nameInUse'),
                            t('addAdditionalSeed:nameInUseExplanation'),
                        );
                    } else if (hasDuplicateSeed(seedInfo, seed)) {
                        return this.props.generateAlert(
                            'error',
                            t('addAdditionalSeed:seedInUse'),
                            t('addAdditionalSeed:seedInUseExplanation'),
                        );
                    }
                    Clipboard.setString(' ');
                    return this.fetchAccountInfo(seed, accountName);
                })
                .catch((err) => console.log(err)); // eslint-disable-line no-console
        }
    }

    showModal = (modalContent) => {
        this.setState({ modalContent });
        this.props.toggleModalActivity();
    };

    hideModal = () => this.props.toggleModalActivity();

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
                        onMount={() => this.props.setDoNotMinimise(true)}
                        onUnmount={() => this.props.setDoNotMinimise(false)}
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
        const { t, theme, isModalActive } = this.props;
        const { modalContent, seed, accountName } = this.state;

        const textColor = { color: theme.body.color };

        return (
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={{ flex: 0.8 }} />
                        <View style={styles.titleContainer}>
                            <Text style={[styles.title, textColor]}>{t('useExistingSeed:title')}</Text>
                        </View>
                        <View style={{ flex: 0.4 }} />
                        <CustomTextInput
                            label={t('global:seed')}
                            onChangeText={(text) => {
                                if (text.match(VALID_SEED_REGEX) || text.length === 0) {
                                    this.setState({ seed: text.toUpperCase() });
                                }
                            }}
                            containerStyle={{ width: width / 1.15 }}
                            autoCapitalize="characters"
                            maxLength={MAX_SEED_LENGTH}
                            value={seed}
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="next"
                            onSubmitEditing={() => {
                                if (seed) {
                                    this.accountNameField.focus();
                                }
                            }}
                            theme={theme}
                            widget="qr"
                            onQRPress={() => this.onQRPress()}
                            seed={seed}
                        />
                        <View style={{ flex: 0.45 }} />
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
                        <View style={{ flex: 0.45 }} />
                        <CustomTextInput
                            onRef={(c) => {
                                this.accountNameField = c;
                            }}
                            label={t('addAdditionalSeed:accountName')}
                            onChangeText={(value) => this.setState({ accountName: value })}
                            containerStyle={{ width: width / 1.15 }}
                            autoCapitalize="words"
                            maxLength={MAX_SEED_LENGTH}
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="done"
                            theme={theme}
                            value={accountName}
                        />
                        <View style={{ flex: 1.2 }} />
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.setSetting('addNewAccount')}
                            style={{ flex: 1 }}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemLeft}>
                                <Icon name="chevronLeft" size={width / 28} color={theme.body.color} />
                                <Text style={[styles.titleTextLeft, textColor]}>{t('global:back')}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.addExistingSeed(seed, trim(accountName))}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                            style={{ flex: 1 }}
                        >
                            <View style={styles.itemRight}>
                                <Text style={[styles.titleTextRight, textColor]}>{t('global:done')}</Text>
                                <Icon name="chevronRight" size={width / 28} color={theme.body.color} />
                            </View>
                        </TouchableOpacity>
                    </View>
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
                        isVisible={isModalActive}
                        onBackButtonPress={() => this.props.toggleModalActivity()}
                        hideModalContentWhileAnimating
                        useNativeDriver={isAndroid}
                    >
                        {this.renderModalContent(modalContent)}
                    </Modal>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    seedCount: state.accounts.seedCount,
    accountNames: state.accounts.accountNames,
    password: state.wallet.password,
    theme: state.settings.theme,
    shouldPreventAction: shouldPreventAction(state),
    isModalActive: state.ui.isModalActive,
});

const mapDispatchToProps = {
    setSetting,
    generateAlert,
    setAdditionalAccountInfo,
    toggleModalActivity,
    setDoNotMinimise,
};

export default translate(['addAdditionalSeed', 'useExistingSeed', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(UseExistingSeed),
);
