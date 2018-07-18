import size from 'lodash/size';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Clipboard } from 'react-native';
import timer from 'react-native-timer';
import { connect } from 'react-redux';
import {
    isValidAddress,
    isValidMessage,
    isValidAmount,
    VALID_ADDRESS_WITH_CHECKSUM_REGEX,
    VALID_SEED_REGEX,
    ADDRESS_LENGTH,
} from 'iota-wallet-shared-modules/libs/iota/utils';
import { setDeepLinkInactive } from 'iota-wallet-shared-modules/actions/wallet';
import {
    getCurrencySymbol,
    getNextDenomination,
    getIOTAUnitMultiplier,
} from 'iota-wallet-shared-modules/libs/currency';
import {
    getFromKeychainRequest,
    getFromKeychainSuccess,
    getFromKeychainError,
} from 'iota-wallet-shared-modules/actions/keychain';
import { makeTransaction } from 'iota-wallet-shared-modules/actions/transfers';
import {
    setSendAddressField,
    setSendAmountField,
    setSendMessageField,
    setSendDenomination,
    setDoNotMinimise,
    toggleModalActivity,
} from 'iota-wallet-shared-modules/actions/ui';
import { round, parse } from 'iota-wallet-shared-modules/libs/utils';
import {
    getBalanceForSelectedAccount,
    getAvailableBalanceForSelectedAccount,
    getSelectedAccountName,
} from 'iota-wallet-shared-modules/selectors/accounts';
import { startTrackingProgress } from 'iota-wallet-shared-modules/actions/progress';
import { generateAlert, generateTransferErrorAlert } from 'iota-wallet-shared-modules/actions/alerts';
import FingerprintScanner from 'react-native-fingerprint-scanner';
import Modal from 'react-native-modal';
import KeepAwake from 'react-native-keep-awake';
import QRScannerComponent from '../components/QrScanner';
import Toggle from '../components/Toggle';
import FingerPrintModal from '../components/FingerprintModal';
import ProgressBar from '../components/ProgressBar';
import ProgressSteps from '../utils/progressSteps';
import { getSeedFromKeychain } from '../utils/keychain';
import TransferConfirmationModal from '../components/TransferConfirmationModal';
import UsedAddressModal from '../components/UsedAddressModal';
import UnitInfoModal from '../components/UnitInfoModal';
import CustomTextInput from '../components/CustomTextInput';
import AmountTextInput from '../components/AmountTextInput';
import CtaButton from '../components/CtaButton';
import { Icon } from '../theme/icons.js';
import { height, width } from '../utils/dimensions';
import { isAndroid } from '../utils/device';
import { getAddressGenFn, getPowFn } from '../utils/nativeModules';
import GENERAL from '../theme/general';
import { leaveNavigationBreadcrumb } from '../utils/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    topContainer: {
        flex: 3.8,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    bottomContainer: {
        flex: 1.9,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    maxContainer: {
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        width: width / 1.15,
        paddingRight: 1,
    },
    maxButtonText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize2,
        backgroundColor: 'transparent',
        marginRight: width / 50,
    },
    infoText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    info: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressSummaryText: {
        fontSize: GENERAL.fontSize2,
    },
});

export class Send extends Component {
    static propTypes = {
        t: PropTypes.func.isRequired,
        currency: PropTypes.string.isRequired,
        balance: PropTypes.number.isRequired,
        availableBalance: PropTypes.number.isRequired,
        isSyncing: PropTypes.bool.isRequired,
        seedIndex: PropTypes.number.isRequired,
        selectedAccountName: PropTypes.string.isRequired,
        conversionRate: PropTypes.number.isRequired,
        usdPrice: PropTypes.number.isRequired,
        isGettingSensitiveInfoToMakeTransaction: PropTypes.bool.isRequired,
        makeTransaction: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        getFromKeychainRequest: PropTypes.func.isRequired,
        getFromKeychainSuccess: PropTypes.func.isRequired,
        getFromKeychainError: PropTypes.func.isRequired,
        closeTopBar: PropTypes.func.isRequired,
        theme: PropTypes.object.isRequired,
        bar: PropTypes.object.isRequired,
        body: PropTypes.object.isRequired,
        primary: PropTypes.object.isRequired,
        isSendingTransfer: PropTypes.bool.isRequired,
        isTransitioning: PropTypes.bool.isRequired,
        address: PropTypes.string.isRequired,
        amount: PropTypes.string.isRequired,
        message: PropTypes.string.isRequired,
        setSendAddressField: PropTypes.func.isRequired,
        setSendAmountField: PropTypes.func.isRequired,
        setSendMessageField: PropTypes.func.isRequired,
        setSendDenomination: PropTypes.func.isRequired,
        startTrackingProgress: PropTypes.func.isRequired,
        denomination: PropTypes.string.isRequired,
        activeStepIndex: PropTypes.number.isRequired,
        activeSteps: PropTypes.array.isRequired,
        timeTakenByEachProgressStep: PropTypes.array.isRequired,
        password: PropTypes.string.isRequired,
        generateTransferErrorAlert: PropTypes.func.isRequired,
        /** Determines if the wallet has just opened a deep link */
        deepLinkActive: PropTypes.bool.isRequired,
        /** Resets deep link status */
        setDeepLinkInactive: PropTypes.func.isRequired,
        /** Determines if user has activated fingerprint auth */
        isFingerprintEnabled: PropTypes.bool.isRequired,
        /** Allow deny application to minimize
         * @param {boolean} status
         */
        setDoNotMinimise: PropTypes.func.isRequired,
        /** Determines whether keyboard is open on iOS */
        isKeyboardActive: PropTypes.bool.isRequired,
        /** Sets whether modal is active or inactive */
        toggleModalActivity: PropTypes.func.isRequired,
        /** Determines whether modal is open */
        isModalActive: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);

        const { t, body } = this.props;

        this.state = {
            modalContent: '', // eslint-disable-line react/no-unused-state
            maxPressed: false,
            maxColor: body.color,
            maxText: t('send:sendMax'),
            sending: false,
            currencySymbol: getCurrencySymbol(this.props.currency),
        };
        this.detectAddressInClipboard = this.detectAddressInClipboard.bind(this);
    }

    componentWillMount() {
        const { t, availableBalance, amount, primary } = this.props;
        const amountAsNumber = parseFloat(amount);

        if (amountAsNumber === availableBalance / this.getUnitMultiplier() && amountAsNumber !== 0) {
            this.setState({
                maxPressed: true,
                maxColor: primary.color,
                maxText: t('send:maximumSelected'),
            });
        }
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('Send');
        const { t, deepLinkActive } = this.props;

        if (deepLinkActive) {
            this.props.generateAlert('success', t('deepLink:autofill'), t('deepLink:autofillExplanation'));
            this.props.setDeepLinkInactive();
        }
    }

    componentWillReceiveProps(newProps) {
        const { seedIndex, isSendingTransfer } = this.props;

        if (!isSendingTransfer && newProps.isSendingTransfer) {
            KeepAwake.activate();
        } else if (isSendingTransfer && !newProps.isSendingTransfer) {
            KeepAwake.deactivate();
            this.setState({ sending: false });

            // Reset toggle switch in case send max is active
            this.resetToggleSwitch();
        }

        if (seedIndex !== newProps.seedIndex) {
            this.resetToggleSwitch();
        }
    }

    shouldComponentUpdate(newProps) {
        const { isSyncing, isTransitioning, usdPrice, conversionRate } = this.props;

        if (isSyncing !== newProps.isSyncing) {
            return false;
        }

        if (isTransitioning !== newProps.isTransitioning) {
            return false;
        }

        if (usdPrice !== newProps.usdPrice) {
            return false;
        }

        if (conversionRate !== newProps.conversionRate) {
            return false;
        }

        return true;
    }

    componentWillUnmount() {
        if (isAndroid) {
            FingerprintScanner.release();
        }
        timer.clearTimeout('invalidAddressAlert');
        timer.clearTimeout('modalShow');
        timer.clearTimeout('delaySend');
    }

    onDenominationPress() {
        const { t, currency, denomination, theme: { body } } = this.props;
        const nextDenomination = getNextDenomination(currency, denomination);
        this.props.setSendDenomination(nextDenomination);
        this.setState({
            maxPressed: false,
            maxColor: body.color,
            maxText: t('send:sendMax'),
        });
    }

    onMaxPress() {
        const { sending, maxPressed } = this.state;
        const { t, body, primary, availableBalance } = this.props;
        const max = (availableBalance / this.getUnitMultiplier()).toString();

        if (sending) {
            return;
        }

        if (availableBalance === 0) {
            return;
        }

        if (maxPressed) {
            this.props.setSendAmountField('');
            this.setState({
                maxPressed: false,
                maxColor: body.color,
                maxText: t('send:sendMax'),
            });
        } else {
            this.props.setSendAmountField(max);
            this.setState({
                maxPressed: true,
                maxColor: primary.color,
                maxText: t('send:maximumSelected'),
            });
        }
    }

    onAmountType(amount) {
        const { t, body, availableBalance } = this.props;
        amount = amount.replace(/,/g, '.');
        this.props.setSendAmountField(amount);

        if (amount === (availableBalance / this.getUnitMultiplier()).toString()) {
            this.onMaxPress();
        } else {
            this.setState({
                maxPressed: false,
                maxColor: body.color,
                maxText: t('send:sendMax'),
            });
        }
    }

    onSendPress() {
        const { t, amount, address, message, denomination, isKeyboardActive } = this.props;
        const { currencySymbol } = this.state;

        const multiplier = this.getUnitMultiplier();
        const isFiat = denomination === currencySymbol;
        const addressIsValid = isValidAddress(address);
        const amountIsValid = isValidAmount(amount, multiplier, isFiat);
        const enoughBalance = this.enoughBalance();
        // const isSpendingFundsAtSpentAddresses = this.isSpendingFundsAtSpentAddresses();
        const messageIsValid = isValidMessage(message);

        if (!addressIsValid) {
            return this.getInvalidAddressError(address);
        }

        if (!amountIsValid) {
            return this.props.generateAlert('error', t('invalidAmount'), t('invalidAmountExplanation'));
        }

        if (!enoughBalance) {
            return this.props.generateAlert('error', t('notEnoughFunds'), t('notEnoughFundsExplanation'));
        }

        /*if (isSpendingFundsAtSpentAddresses) {
            return this.openModal('usedAddress');
        }*/

        if (!messageIsValid) {
            return this.props.generateAlert('error', t('invalidMessage'), t('invalidMessageExplanation'));
        }
        this.showModal('transferConfirmation');
        if (parseFloat(amount) * multiplier > 0) {
            timer.setTimeout(
                'addressPasteAlertDelay',
                () => this.detectAddressInClipboard(),
                isKeyboardActive ? 1000 : 250,
            );
        }
    }

    onQRRead(data) {
        const dataString = data.toString();
        const { t } = this.props;
        const parsedData = parse(data);
        const dataSubstring = data.substring(5);
        this.hideModal();

        // Clear clipboard
        Clipboard.setString(' ');

        if (parsedData.address) {
            // For codes containing JSON (iotaledger and Trinity)
            this.props.setSendAddressField(parsedData.address);
            if (parsedData.message) {
                this.props.setSendMessageField(parsedData.message);
            }
            if (parsedData.amount) {
                this.props.setSendAmountField(parsedData.amount);
            }
        } else if (dataString.startsWith('iota:') && dataSubstring.match(VALID_ADDRESS_WITH_CHECKSUM_REGEX)) {
            // For codes with iota: at the front (TheTangle.org)
            this.props.setSendAddressField(dataSubstring);
        } else if (dataString.match(VALID_ADDRESS_WITH_CHECKSUM_REGEX)) {
            // For codes with plain text (Bitfinex, Binance, and IOTASear.ch)
            this.props.setSendAddressField(data);
        } else {
            timer.setTimeout(
                'invalidAddressAlert',
                () => this.props.generateAlert('error', t('invalidAddress'), t('invalidAddressExplanationGeneric')),
                500,
            );
        }
    }

    getInvalidAddressError(address) {
        const { t } = this.props;
        const props = ['error', t('invalidAddress')];

        if (size(address) !== 90) {
            return this.props.generateAlert(...props, t('invalidAddressExplanation1', { maxLength: ADDRESS_LENGTH }));
        } else if (address.match(VALID_SEED_REGEX) === null) {
            return this.props.generateAlert(...props, t('invalidAddressExplanation2'));
        }

        return this.props.generateAlert(...props, t('invalidAddressExplanation3'));
    }

    getModalProps() {
        const { isModalActive, body } = this.props;
        const props = {
            animationIn: isAndroid ? 'bounceInUp' : 'zoomIn',
            animationOut: isAndroid ? 'bounceOut' : 'zoomOut',
            animationInTiming: isAndroid ? 1000 : 300,
            animationOutTiming: 200,
            backdropTransitionInTiming: isAndroid ? 500 : 300,
            backdropTransitionOutTiming: 200,
            backdropColor: body.bg,
            style: { justifyContent: 'center', alignItems: 'center', margin: 0, height, width },
            isVisible: isModalActive,
            onBackButtonPress: () => this.props.toggleModalActivity(),
            hideModalContentWhileAnimating: true,
            useNativeDriver: isAndroid ? true : false,
        };
        return props;
    }

    /**
     *   Gets multiplier used in converting IOTA denominations (Ti, Gi, Mi, Ki, i) and fiat to basic IOTA unit (i)
     *   @method getUnitMultiplier
     *   @returns {number}
     **/
    getUnitMultiplier() {
        const { usdPrice, conversionRate, denomination } = this.props;
        const { currencySymbol } = this.state;
        if (denomination === currencySymbol) {
            return 1000000 / usdPrice / conversionRate;
        }
        return getIOTAUnitMultiplier(denomination);
    }

    setSendingTransferFlag() {
        this.setState({ sending: true });
    }

    getSendMaxOpacity() {
        const { balance } = this.props;
        if (balance === 0) {
            return 0.2;
        }

        return 1;
    }

    getProgressSummary() {
        const { timeTakenByEachProgressStep } = this.props;
        const totalTimeTaken = reduce(timeTakenByEachProgressStep, (acc, time) => acc + Number(time), 0);

        return (
            <Text>
                <Text style={styles.progressSummaryText}>
                    {map(timeTakenByEachProgressStep, (time, index) => {
                        if (index === size(timeTakenByEachProgressStep) - 1) {
                            return `${time} = ${totalTimeTaken.toFixed(1)} s`;
                        }

                        return `${time} + `;
                    })}
                </Text>
            </Text>
        );
    }

    getConversionTextIOTA() {
        const { amount, usdPrice, conversionRate } = this.props;
        const { currencySymbol } = this.state;
        const convertedValue = round(
            parseFloat(amount) * usdPrice / 1000000 * this.getUnitMultiplier() * conversionRate,
            10,
        );
        let conversionText = '';
        if (convertedValue > 0 && convertedValue < 0.01) {
            conversionText = `< ${currencySymbol}0.01`;
        } else if (convertedValue >= 0.01) {
            conversionText = `= ${currencySymbol}${convertedValue.toFixed(2)}`;
        }
        return conversionText;
    }

    async detectAddressInClipboard() {
        const { t } = this.props;
        const clipboardContent = await Clipboard.getString();
        if (clipboardContent.match(VALID_ADDRESS_WITH_CHECKSUM_REGEX)) {
            this.props.generateAlert('info', t('addressPasteDetected'), t('addressPasteExplanation'));
        }
    }

    resetToggleSwitch() {
        const { maxPressed } = this.state;
        const { t } = this.props;

        if (maxPressed) {
            this.setState({
                maxPressed: !maxPressed,
                maxText: t('send:sendMax'),
            });
        }
    }

    clearInteractions() {
        this.props.closeTopBar();
        Keyboard.dismiss();
    }

    showModal(modalContent) {
        this.setState({ modalContent });
        this.openModal();
    }

    openModal = () => {
        const { isKeyboardActive } = this.props;
        if (isKeyboardActive) {
            this.blurTextFields();
            timer.setTimeout('modalShow', () => this.props.toggleModalActivity(), 500);
        } else {
            this.props.toggleModalActivity();
        }
    };

    hideModal = () => {
        this.props.toggleModalActivity();
    };

    enoughBalance() {
        const { amount, balance } = this.props;
        const multiplier = this.getUnitMultiplier();

        if (parseFloat(amount) * multiplier > balance) {
            return false;
        }

        return true;
    }

    isSpendingFundsAtSpentAddresses() {
        const { amount, balance, availableBalance } = this.props;
        const multiplier = this.getUnitMultiplier();
        const value = parseInt(amount) * multiplier;
        if (value <= balance && value > availableBalance) {
            return true;
        }
        return false;
    }

    startTrackingTransactionProgress(isZeroValueTransaction) {
        const steps = isZeroValueTransaction ? ProgressSteps.zeroValueTransaction : ProgressSteps.valueTransaction;

        this.props.startTrackingProgress(steps);
    }

    sendTransfer() {
        const { t, password, selectedAccountName, isSyncing, isTransitioning, message, amount, address } = this.props;

        if (isSyncing) {
            this.props.generateAlert('error', t('global:syncInProgress'), t('global:syncInProgressExplanation'));
            return;
        }

        if (isTransitioning) {
            this.props.generateAlert(
                'error',
                t('snapshotTransitionInProgress'),
                t('snapshotTransitionInProgressExplanation'),
            );

            return;
        }

        // For sending a message
        const formattedAmount = amount === '' ? 0 : amount;
        const value = parseInt(parseFloat(formattedAmount) * this.getUnitMultiplier(), 10);

        // Start tracking progress for each transaction step
        this.startTrackingTransactionProgress(value === 0);

        this.props.getFromKeychainRequest('send', 'makeTransaction');
        getSeedFromKeychain(password, selectedAccountName)
            .then((seed) => {
                this.props.getFromKeychainSuccess('send', 'makeTransaction');

                if (seed === null) {
                    this.props.generateAlert(
                        'error',
                        t('global:somethingWentWrong'),
                        t('global:somethingWentWrongTryAgain'),
                    );

                    throw new Error('Error');
                }

                const powFn = getPowFn();
                const genFn = getAddressGenFn();

                return this.props.makeTransaction(seed, address, value, message, selectedAccountName, powFn, genFn);
            })
            .catch((error) => {
                this.props.getFromKeychainError('send', 'makeTransaction');
                this.props.generateTransferErrorAlert(error);
            });
    }

    sendWithDelay() {
        timer.setTimeout('delaySend', () => this.sendTransfer(), 200);
    }

    activateFingerprintScanner() {
        const { t } = this.props;
        if (isAndroid) {
            this.setState({ modalContent: 'fingerPrintModal' });
        }
        FingerprintScanner.authenticate({ description: t('fingerprintOnSend') })
            .then(() => {
                this.setSendingTransferFlag();
                if (isAndroid) {
                    this.hideModal();
                }
                this.sendWithDelay();
            })
            .catch(() => {
                if (isAndroid) {
                    this.hideModal();
                }
                this.props.generateAlert(
                    'error',
                    t('fingerprintSetup:fingerprintAuthFailed'),
                    t('fingerprintSetup:fingerprintAuthFailedExplanation'),
                );
            });
    }

    blurTextFields() {
        this.addressField.blur();
        this.amountField.blur();
        this.messageField.blur();
    }

    renderProgressBarChildren() {
        const { activeStepIndex, activeSteps } = this.props;
        const totalSteps = size(activeSteps);

        if (activeStepIndex === totalSteps) {
            return this.getProgressSummary();
        }

        return activeSteps[activeStepIndex] ? activeSteps[activeStepIndex] : null;
    }

    renderModal() {
        const { bar, body, primary, address, amount, selectedAccountName, isFingerprintEnabled } = this.props;
        const { modalContent } = this.state;
        const modalProps = this.getModalProps();
        switch (modalContent) {
            case 'qrScanner':
                return (
                    <Modal {...modalProps}>
                        <QRScannerComponent
                            onQRRead={(data) => this.onQRRead(data)}
                            hideModal={() => this.hideModal()}
                            primary={primary}
                            body={body}
                            onMount={() => this.props.setDoNotMinimise(true)}
                            onUnmount={() => this.props.setDoNotMinimise(false)}
                        />
                    </Modal>
                );
            case 'transferConfirmation':
                return (
                    <Modal {...modalProps}>
                        <TransferConfirmationModal
                            value={parseFloat(amount) * this.getUnitMultiplier()}
                            amount={amount}
                            conversionText={this.getConversionTextIOTA()}
                            address={address}
                            sendTransfer={() => this.sendWithDelay()}
                            hideModal={(callback) => this.hideModal(callback)}
                            body={body}
                            bar={bar}
                            borderColor={{ borderColor: body.color }}
                            textColor={{ color: body.color }}
                            setSendingTransferFlag={() => this.setSendingTransferFlag()}
                            selectedAccountName={selectedAccountName}
                            activateFingerprintScanner={() => this.activateFingerprintScanner()}
                            isFingerprintEnabled={isFingerprintEnabled}
                        />
                    </Modal>
                );
            case 'unitInfo':
                return (
                    <Modal {...modalProps}>
                        <UnitInfoModal
                            hideModal={() => this.hideModal()}
                            textColor={{ color: bar.color }}
                            lineColor={{ borderLeftColor: bar.color }}
                            borderColor={{ borderColor: bar.color }}
                            bar={bar}
                        />
                    </Modal>
                );
            case 'usedAddress':
                return (
                    <Modal {...modalProps}>
                        <UsedAddressModal
                            hideModal={(callback) => this.hideModal(callback)}
                            body={body}
                            bar={bar}
                            borderColor={{ borderColor: body.color }}
                            textColor={{ color: body.color }}
                        />
                    </Modal>
                );
            case 'fingerPrintModal':
                return (
                    <Modal {...modalProps}>
                        <FingerPrintModal
                            hideModal={this.hideModal}
                            borderColor={{ borderColor: body.color }}
                            textColor={{ color: body.color }}
                            backgroundColor={{ backgroundColor: body.bg }}
                            instance="send"
                        />
                    </Modal>
                );
            default:
                break;
        }
    }

    render() {
        const { maxPressed, maxColor, maxText, sending } = this.state;
        const {
            t,
            isSendingTransfer,
            isGettingSensitiveInfoToMakeTransaction,
            address,
            amount,
            message,
            denomination,
            theme,
            body,
            primary,
            isKeyboardActive,
        } = this.props;
        const textColor = { color: body.color };
        const opacity = this.getSendMaxOpacity();
        const isSending = sending || isSendingTransfer;

        return (
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => this.clearInteractions()}>
                <View style={styles.container}>
                    <View style={{ flex: 0.5 }} />
                    <View style={styles.topContainer}>
                        <CustomTextInput
                            onRef={(c) => {
                                this.addressField = c;
                            }}
                            maxLength={90}
                            label={t('recipientAddress')}
                            onChangeText={(text) => {
                                if (text.match(VALID_SEED_REGEX) || text.length === 0) {
                                    this.props.setSendAddressField(text);
                                }
                            }}
                            containerStyle={{ width: width / 1.15 }}
                            autoCapitalize="characters"
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="next"
                            onSubmitEditing={() => {
                                if (address) {
                                    this.amountField.focus();
                                }
                            }}
                            widget="qr"
                            onQRPress={() => {
                                if (!isSending) {
                                    this.showModal('qrScanner');
                                }
                            }}
                            theme={theme}
                            value={address}
                            editable={!isSending}
                            selectTextOnFocus={!isSending}
                            detectAddressInClipboard={this.detectAddressInClipboard}
                        />
                        <View style={{ flex: 0.17 }} />
                        <AmountTextInput
                            label={t('amount')}
                            amount={amount}
                            denomination={denomination}
                            multiplier={this.getUnitMultiplier()}
                            editable={!isSending}
                            setAmount={(text) => this.props.setSendAmountField(text)}
                            setDenomination={(text) => this.props.setSendDenomination(text)}
                            containerStyle={{ width: width / 1.15 }}
                            onRef={(c) => {
                                this.amountField = c;
                            }}
                            onSubmitEditing={() => {
                                if (amount) {
                                    this.messageField.focus();
                                }
                            }}
                        />
                        <View style={{ flex: 0.09 }} />
                        <View
                            style={[
                                styles.maxContainer,
                                { opacity: opacity, flex: isAndroid ? (isKeyboardActive ? 0.8 : 0.4) : 0.4 },
                            ]}
                        >
                            <TouchableOpacity
                                onPress={() => {
                                    if (!isSending) {
                                        this.onMaxPress();
                                    }
                                }}
                            >
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'flex-start',
                                    }}
                                >
                                    <Text style={[styles.maxButtonText, { color: maxColor }]}>{maxText}</Text>
                                    <Toggle
                                        opacity={opacity}
                                        active={maxPressed}
                                        bodyColor={body.color}
                                        primaryColor={primary.color}
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 0.1 }} />
                        <CustomTextInput
                            onRef={(c) => {
                                this.messageField = c;
                            }}
                            keyboardType="default"
                            label={t('message')}
                            onChangeText={(text) => this.props.setSendMessageField(text)}
                            containerStyle={{ width: width / 1.15 }}
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="send"
                            blurOnSubmit
                            onSubmitEditing={() => this.onSendPress()}
                            theme={theme}
                            value={message}
                            editable={!isSending}
                            selectTextOnFocus={!isSending}
                            multiplier={this.getUnitMultiplier()}
                        />
                    </View>
                    <View style={styles.bottomContainer}>
                        <View style={{ flex: 0.25 }} />
                        {!isSendingTransfer &&
                            !isGettingSensitiveInfoToMakeTransaction && (
                                <View style={{ flex: 1 }}>
                                    <CtaButton
                                        ctaColor={primary.color}
                                        secondaryCtaColor={primary.body}
                                        text={t('send')}
                                        onPress={() => {
                                            this.onSendPress();
                                            if (address === '' && amount === '' && message && '') {
                                                this.blurTextFields();
                                            }
                                        }}
                                    />
                                </View>
                            )}
                        {(isGettingSensitiveInfoToMakeTransaction || isSendingTransfer) && (
                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <ProgressBar
                                    indeterminate={this.props.activeStepIndex === -1}
                                    progress={this.props.activeStepIndex / size(this.props.activeSteps)}
                                    color={primary.color}
                                    textColor={body.color}
                                >
                                    {this.renderProgressBarChildren()}
                                </ProgressBar>
                            </View>
                        )}
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableOpacity
                                onPress={() => this.showModal('unitInfo')}
                                hitSlop={{ top: width / 30, bottom: width / 30, left: width / 30, right: width / 30 }}
                            >
                                <View style={styles.info}>
                                    <Icon
                                        name="info"
                                        size={width / 22}
                                        color={body.color}
                                        style={{ marginRight: width / 60 }}
                                    />
                                    <Text style={[styles.infoText, textColor]}>{t('iotaUnits')}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 0.3 }} />
                    </View>
                    {this.renderModal()}
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    currency: state.settings.currency,
    balance: getBalanceForSelectedAccount(state),
    availableBalance: getAvailableBalanceForSelectedAccount(state),
    selectedAccountName: getSelectedAccountName(state),
    isSyncing: state.ui.isSyncing,
    isSendingTransfer: state.ui.isSendingTransfer,
    seedIndex: state.wallet.seedIndex,
    conversionRate: state.settings.conversionRate,
    usdPrice: state.marketData.usdPrice,
    isGettingSensitiveInfoToMakeTransaction: state.keychain.isGettingSensitiveInfo.send.makeTransaction,
    theme: state.settings.theme,
    body: state.settings.theme.body,
    primary: state.settings.theme.primary,
    bar: state.settings.theme.bar,
    isTransitioning: state.ui.isTransitioning,
    address: state.ui.sendAddressFieldText,
    amount: state.ui.sendAmountFieldText,
    message: state.ui.sendMessageFieldText,
    denomination: state.ui.sendDenomination,
    activeStepIndex: state.progress.activeStepIndex,
    activeSteps: state.progress.activeSteps,
    timeTakenByEachProgressStep: state.progress.timeTakenByEachStep,
    remotePoW: state.settings.remotePoW,
    password: state.wallet.password,
    deepLinkActive: state.wallet.deepLinkActive,
    isFingerprintEnabled: state.settings.isFingerprintEnabled,
    isModalActive: state.ui.isModalActive,
});

const mapDispatchToProps = {
    makeTransaction,
    generateAlert,
    getFromKeychainRequest,
    getFromKeychainSuccess,
    getFromKeychainError,
    setSendAddressField,
    setSendAmountField,
    setSendMessageField,
    setSendDenomination,
    startTrackingProgress,
    generateTransferErrorAlert,
    setDeepLinkInactive,
    setDoNotMinimise,
    toggleModalActivity,
};

export default translate(['send', 'global'])(connect(mapStateToProps, mapDispatchToProps)(Send));
