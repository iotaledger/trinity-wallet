import trim from 'lodash/trim';
import isNull from 'lodash/isNull';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Clipboard } from 'react-native';
import Modal from 'react-native-modal';
import { MAX_SEED_LENGTH, VALID_SEED_REGEX } from 'iota-wallet-shared-modules/libs/iota/utils';
import { setSetting, setAdditionalAccountInfo } from 'iota-wallet-shared-modules/actions/wallet';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { shouldPreventAction } from 'iota-wallet-shared-modules/selectors/global';
import { toggleModalActivity, setDoNotMinimise } from 'iota-wallet-shared-modules/actions/ui';
import timer from 'react-native-timer';
import { hasDuplicateAccountName, hasDuplicateSeed, getAllSeedsFromKeychain } from '../utils/keychain';
import CustomTextInput from '../components/CustomTextInput';
import Checksum from '../components/Checksum';
import QRScannerComponent from '../components/QrScanner';
import { width, height } from '../utils/dimensions';
import { Icon } from '../theme/icons.js';
import { isAndroid } from '../utils/device';
import GENERAL from '../theme/general';

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
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: height / 30,
    },
    subtitleContainer: {
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
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
    textFieldContainer: {
        flex: 1,
        paddingRight: width / 30,
        justifyContent: 'center',
    },
    textField: {
        fontFamily: 'SourceSansPro-Light',
    },
    accountNameContainer: {
        flex: 4,
        alignItems: 'center',
    },
    seedContainer: {
        flex: 6.5,
        alignItems: 'center',
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
});

/** Use Existing Seed component */
class UseExistingSeed extends Component {
    static propTypes = {
        /** Total number of seeds stored on device */
        seedCount: PropTypes.number.isRequired,
        /** List of account names  */
        accountNames: PropTypes.array.isRequired,
        /** Hash for wallet's password */
        password: PropTypes.string.isRequired,
        /** Determines whether addition of new seed is allowed */
        shouldPreventAction: PropTypes.bool.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Generate a notification alert
         * @param {string} type - notification type - success, error
         * @param {string} title - notification title
         * @param {string} text - notification explanation
         */
        generateAlert: PropTypes.func.isRequired,
        /** Set additional account information in store
         * @param {object} info - (addingAdditionalAccount, additionalAccountName, seed)
         */
        setAdditionalAccountInfo: PropTypes.func.isRequired,
        /** Change current setting
         * @param {string} setting
         */
        setSetting: PropTypes.func.isRequired,
        /** Determines whether modal is open */
        isModalActive: PropTypes.bool.isRequired,
        /** Sets whether modal is active or inactive */
        toggleModalActivity: PropTypes.func.isRequired,
        /** Determines whether component can minimise
         * @param {boolean} status
         */
        setDoNotMinimise: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            seed: '',
            accountName: this.getDefaultAccountName(),
        };
    }

    componentWillUnmount() {
        timer.clearTimeout('invalidSeedAlert');
    }

    onQRPress() {
        this.showModal();
    }

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
                .catch((err) => console.log(err)); // eslint-disable no-console
        }
    }

    showModal = () => this.props.toggleModalActivity();

    hideModal = () => this.props.toggleModalActivity();

    renderModalContent = () => {
        const { theme: { body, primary } } = this.props;
        return (
            <QRScannerComponent
                primary={primary}
                body={body}
                onQRRead={(data) => this.onQRRead(data)}
                hideModal={() => this.hideModal()}
                onMount={() => this.props.setDoNotMinimise(true)}
                onUnmount={() => this.props.setDoNotMinimise(false)}
            />
        );
    };

    render() {
        const { t, theme, isModalActive } = this.props;
        const { seed, accountName } = this.state;

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
                        />
                        <View style={{ flex: 0.6 }} />
                        <Checksum seed={seed} theme={theme} />
                        <View style={{ flex: 0.3 }} />
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
                                <Text style={[styles.titleTextLeft, textColor]}>{t('global:backLowercase')}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.addExistingSeed(seed, trim(accountName))}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                            style={{ flex: 1 }}
                        >
                            <View style={styles.itemRight}>
                                <Text style={[styles.titleTextRight, textColor]}>{t('global:doneLowercase')}</Text>
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
                        backdropOpacity={1}
                        style={{ alignItems: 'center', margin: 0 }}
                        isVisible={isModalActive}
                        onBackButtonPress={() => this.props.toggleModalActivity()}
                        hideModalContentWhileAnimating
                        useNativeDriver={isAndroid}
                    >
                        {this.renderModalContent()}
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
