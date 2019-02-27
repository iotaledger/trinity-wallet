import size from 'lodash/size';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';
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
} from 'shared-modules/libs/iota/utils';
import { setDeepLinkInactive } from 'shared-modules/actions/wallet';
import { getCurrencySymbol, getIOTAUnitMultiplier } from 'shared-modules/libs/currency';
import { getFromKeychainRequest, getFromKeychainSuccess, getFromKeychainError } from 'shared-modules/actions/keychain';
import { makeTransaction } from 'shared-modules/actions/transfers';
import {
    setSendAddressField,
    setSendAmountField,
    setSendMessageField,
    setSendDenomination,
    setDoNotMinimise,
    toggleModalActivity,
} from 'shared-modules/actions/ui';
import { round, parse } from 'shared-modules/libs/utils';
import {
    getBalanceForSelectedAccount,
    getAvailableBalanceForSelectedAccount,
    getSelectedAccountName,
    getSelectedAccountMeta,
} from 'shared-modules/selectors/accounts';
import { startTrackingProgress } from 'shared-modules/actions/progress';
import { generateAlert, generateTransferErrorAlert } from 'shared-modules/actions/alerts';
import { getThemeFromState } from 'shared-modules/selectors/global';
import FingerprintScanner from 'react-native-fingerprint-scanner';
import KeepAwake from 'react-native-keep-awake';
import Toggle from 'ui/components/Toggle';
import SendProgressBar from 'ui/components/SendProgressBar';
import ProgressSteps from 'libs/progressSteps';
import SeedStore from 'libs/SeedStore';
import CustomTextInput from 'ui/components/CustomTextInput';
import AmountTextInput from 'ui/components/AmountTextInput';
import { Icon } from 'ui/theme/icons';
import { width } from 'libs/dimensions';
import { isAndroid } from 'libs/device';
import { Styling } from 'ui/theme/general';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

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
        justifyContent: 'center',
        alignItems: 'flex-end',
        width: Styling.contentWidth,
        paddingRight: 1,
    },
    maxButtonText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize2,
        backgroundColor: 'transparent',
        marginRight: width / 50,
    },
    infoText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    info: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export class Send extends Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        currency: PropTypes.string.isRequired,
        /** Balance for selected account */
        balance: PropTypes.number.isRequired,
        /** Available balance for selected account */
        availableBalance: PropTypes.number.isRequired,
        /** @ignore */
        isSyncing: PropTypes.bool.isRequired,
        /** @ignore */
        seedIndex: PropTypes.number.isRequired,
        /** Name for selected account */
        selectedAccountName: PropTypes.string.isRequired,
        /** Name for selected account */
        selectedAccountMeta: PropTypes.object.isRequired,
        /** @ignore */
        conversionRate: PropTypes.number.isRequired,
        /** @ignore */
        usdPrice: PropTypes.number.isRequired,
        /** @ignore */
        makeTransaction: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        getFromKeychainRequest: PropTypes.func.isRequired,
        /** @ignore */
        getFromKeychainSuccess: PropTypes.func.isRequired,
        /** @ignore */
        getFromKeychainError: PropTypes.func.isRequired,
        /** @ignore */
        closeTopBar: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        isSendingTransfer: PropTypes.bool.isRequired,
        /** @ignore */
        isTransitioning: PropTypes.bool.isRequired,
        /** @ignore */
        address: PropTypes.string.isRequired,
        /** @ignore */
        amount: PropTypes.string.isRequired,
        /** @ignore */
        message: PropTypes.string.isRequired,
        /** @ignore */
        setSendAddressField: PropTypes.func.isRequired,
        /** @ignore */
        setSendAmountField: PropTypes.func.isRequired,
        /** @ignore */
        setSendMessageField: PropTypes.func.isRequired,
        /** @ignore */
        setSendDenomination: PropTypes.func.isRequired,
        /** @ignore */
        startTrackingProgress: PropTypes.func.isRequired,
        /** @ignore */
        denomination: PropTypes.string.isRequired,
        /** @ignore */
        activeStepIndex: PropTypes.number.isRequired,
        /** @ignore */
        activeSteps: PropTypes.array.isRequired,
        /** @ignore */
        generateTransferErrorAlert: PropTypes.func.isRequired,
        /** @ignore */
        deepLinkActive: PropTypes.bool.isRequired,
        /** @ignore */
        setDeepLinkInactive: PropTypes.func.isRequired,
        /** @ignore */
        isFingerprintEnabled: PropTypes.bool.isRequired,
        /** @ignore */
        setDoNotMinimise: PropTypes.func.isRequired,
        /** @ignore */
        isKeyboardActive: PropTypes.bool.isRequired,
        /** @ignore */
        toggleModalActivity: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        const { t, theme } = this.props;
        const { body } = theme;

        this.state = {
            modalContent: '', // eslint-disable-line react/no-unused-state
            maxPressed: false,
            maxColor: body.color,
            maxText: t('send:sendMax'),
            sending: false,
            currencySymbol: getCurrencySymbol(this.props.currency),
            shouldInteruptSendAnimation: false,
        };
        this.detectAddressInClipboard = this.detectAddressInClipboard.bind(this);
    }

    componentWillMount() {
        const { availableBalance, amount } = this.props;
        const amountAsNumber = parseFloat(amount);
        if (amountAsNumber === availableBalance / this.getUnitMultiplier() && amountAsNumber !== 0) {
            this.setMaxPressed();
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
        const { seedIndex, isSendingTransfer, address } = this.props;
        if (!isSendingTransfer && newProps.isSendingTransfer) {
            KeepAwake.activate();
        } else if (isSendingTransfer && !newProps.isSendingTransfer) {
            KeepAwake.deactivate();
            this.setState({ sending: false });
            this.resetMaxPressed();
            this.interuptSendAnimation();
        }
        if (seedIndex !== newProps.seedIndex) {
            this.resetMaxPressed();
        }
        if (address.length === 0 && newProps.address.length === 90) {
            this.detectAddressInClipboard();
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

    onMaxPress() {
        const { sending, maxPressed } = this.state;
        const { availableBalance } = this.props;
        const max = (availableBalance / this.getUnitMultiplier()).toString();

        if (sending) {
            return;
        }
        if (availableBalance === 0) {
            return;
        }
        if (maxPressed) {
            this.props.setSendAmountField('');
            this.resetMaxPressed();
        } else {
            this.props.setSendAmountField(max);
            this.setMaxPressed();
        }
    }

    onAmountType(amount) {
        const { availableBalance } = this.props;
        amount = amount.replace(/,/g, '.');
        this.props.setSendAmountField(amount);

        if (amount === (availableBalance / this.getUnitMultiplier()).toString()) {
            this.onMaxPress();
        } else {
            this.resetMaxPressed();
        }
    }

    /**
     * Send button event callback method
     *
     * @method onSendPress
     * @returns {function}
     */
    onSendPress() {
        const { t, amount, address, message, denomination } = this.props;
        const { currencySymbol } = this.state;
        const multiplier = this.getUnitMultiplier();
        const isFiat = denomination === currencySymbol;
        const addressIsValid = isValidAddress(address);
        const amountIsValid = isValidAmount(amount, multiplier, isFiat);
        const enoughBalance = this.enoughBalance();
        // const isSpendingFundsAtSpentAddresses = this.isSpendingFundsAtSpentAddresses();
        const messageIsValid = isValidMessage(message);
        if (!addressIsValid) {
            this.interuptSendAnimation();
            return this.getInvalidAddressError(address);
        }
        if (!amountIsValid) {
            this.interuptSendAnimation();
            return this.props.generateAlert('error', t('invalidAmount'), t('invalidAmountExplanation'));
        }
        if (!enoughBalance) {
            this.interuptSendAnimation();
            return this.props.generateAlert('error', t('notEnoughFunds'), t('notEnoughFundsExplanation'));
        }
        /*if (isSpendingFundsAtSpentAddresses) {
            return this.openModal('usedAddress');
        }*/
        if (!messageIsValid) {
            this.interuptSendAnimation();
            return this.props.generateAlert('error', t('invalidMessage'), t('invalidMessageExplanation'));
        }
        this.showModal('transferConfirmation');
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
                this.props.setSendAmountField(parsedData.amount.toString());
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

    getProgressBarText() {
        const { activeStepIndex, activeSteps } = this.props;
        const totalSteps = size(activeSteps);
        if (activeStepIndex === totalSteps) {
            return 'progressSteps:transferComplete';
        }
        return activeSteps[activeStepIndex] ? activeSteps[activeStepIndex] : '';
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

    /**
     *   Turns on send max toggle
     *   @method setMaxPressed
     **/
    setMaxPressed() {
        const { theme, t } = this.props;
        this.setState({
            maxPressed: true,
            maxColor: theme.primary.color,
            maxText: t('send:maximumSelected'),
        });
    }

    interuptSendAnimation() {
        this.setState({ shouldInteruptSendAnimation: !this.state.shouldInteruptSendAnimation });
    }

    /**
     *   Turns off send max toggle
     *   @method resetMaxPressed
     **/
    resetMaxPressed() {
        const { theme, t } = this.props;
        this.setState({
            maxPressed: false,
            maxColor: theme.body.color,
            maxText: t('send:sendMax'),
        });
    }

    /**
     * Generates an alert if address paste is detected
     *
     * @method detectAddressInClipboard
     * @returns {Promise<void>}
     */
    async detectAddressInClipboard() {
        const { t } = this.props;
        const clipboardContent = await Clipboard.getString();
        if (clipboardContent.match(VALID_ADDRESS_WITH_CHECKSUM_REGEX)) {
            this.props.generateAlert('info', t('addressPasteDetected'), t('addressPasteExplanation'));
        }
    }

    clearInteractions() {
        this.props.closeTopBar();
        Keyboard.dismiss();
    }

    /**
     * Shows specific modal
     *
     * @method showModal
     * @param  {String} modalContent
     */
    showModal(modalContent) {
        const { theme, address, amount, selectedAccountName, isFingerprintEnabled, message } = this.props;

        switch (modalContent) {
            case 'qrScanner':
                return this.props.toggleModalActivity(modalContent, {
                    onQRRead: (data) => this.onQRRead(data),
                    hideModal: () => this.hideModal(),
                    theme,
                    onMount: () => this.props.setDoNotMinimise(true),
                    onUnmount: () => this.props.setDoNotMinimise(false),
                    displayTopBar: true,
                });
            case 'transferConfirmation':
                return this.props.toggleModalActivity(modalContent, {
                    value: parseFloat(amount) * this.getUnitMultiplier(),
                    amount,
                    conversionText: this.getConversionTextIOTA(),
                    address: address,
                    sendTransfer: () => this.sendTransfer(),
                    onBackButtonPress: () => {
                        this.interuptSendAnimation();
                        this.hideModal();
                    },
                    hideModal: (callback) => this.hideModal(callback),
                    body: theme.body,
                    borderColor: { borderColor: theme.body.color },
                    textColor: { color: theme.body.color },
                    setSendingTransferFlag: () => this.setSendingTransferFlag(),
                    selectedAccountName,
                    activateFingerprintScanner: () => this.activateFingerprintScanner(),
                    isFingerprintEnabled,
                    theme,
                    message,
                });
            case 'unitInfo':
                return this.props.toggleModalActivity(modalContent, {
                    hideModal: () => this.hideModal(),
                    theme,
                    textColor: { color: theme.bar.color },
                    lineColor: { borderLeftColor: theme.bar.color },
                    borderColor: { borderColor: theme.bar.color },
                    bar: theme.bar.color,
                });
            case 'usedAddress':
                return this.props.toggleModalActivity(modalContent, {
                    hideModal: (callback) => this.hideModal(callback),
                    body: theme.body,
                    bar: theme.bar,
                    borderColor: { borderColor: theme.body.color },
                    textColor: { color: theme.body.color },
                });
            case 'fingerprint':
                return this.props.toggleModalActivity(modalContent, {
                    hideModal: this.hideModal,
                    borderColor: { borderColor: theme.body.color },
                    textColor: { color: theme.body.color },
                    backgroundColor: { backgroundColor: theme.body.bg },
                    onBackButtonPress: () => {
                        this.interuptSendAnimation();
                        this.hideModal();
                    },
                    instance: 'send',
                    theme,
                    onSuccess: () => {
                        this.setSendingTransferFlag();
                        this.hideModal();
                        this.sendTransfer();
                    },
                });
            default:
                break;
        }
    }

    /**
     * Hides modal
     *
     * @method hideModal
     */
    hideModal = () => {
        this.props.toggleModalActivity();
    };

    /**
     * Determines if user's balance is less than the entered amount
     *
     * @method enoughBalance
     * @returns {boolean}
     */
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

    /**
     * Activates progress bar steps
     * @param {boolean} isZeroValueTransaction
     */
    startTrackingTransactionProgress(isZeroValueTransaction) {
        const steps = isZeroValueTransaction ? ProgressSteps.zeroValueTransaction : ProgressSteps.valueTransaction;

        this.props.startTrackingProgress(steps);
    }

    /**
     * Gets seed from keychain and initiates transfer. Delay allow for the modal to close.
     *
     * @method sendTransfer
     */
    sendTransfer() {
        const {
            t,
            selectedAccountName,
            selectedAccountMeta,
            isSyncing,
            isTransitioning,
            message,
            amount,
            address,
        } = this.props;

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

        timer.setTimeout(
            'delaySend',
            async () => {
                this.props.getFromKeychainRequest('send', 'makeTransaction');
                try {
                    const seedStore = await new SeedStore[selectedAccountMeta.type](
                        global.passwordHash,
                        selectedAccountName,
                    );
                    this.props.getFromKeychainSuccess('send', 'makeTransaction');

                    return this.props.makeTransaction(seedStore, address, value, message, selectedAccountName);
                } catch (error) {
                    this.props.getFromKeychainError('send', 'makeTransaction');
                    this.props.generateTransferErrorAlert(error);
                }
            },
            200,
        );
    }

    /**
     * Activates fingerprint scanner
     *
     * @method activateFingerprintScanner
     */
    activateFingerprintScanner() {
        const { t } = this.props;
        if (isAndroid) {
            this.props.toggleModalActivity();
            return timer.setTimeout('displayFingerPrintModal', () => this.showModal('fingerprint'), 300);
        }
        FingerprintScanner.authenticate({ description: t('fingerprintOnSend') })
            .then(() => {
                this.setSendingTransferFlag();
                this.sendTransfer();
            })
            .catch(() => {
                this.props.generateAlert(
                    'error',
                    t('fingerprintSetup:fingerprintAuthFailed'),
                    t('fingerprintSetup:fingerprintAuthFailedExplanation'),
                );
            });
    }

    /**
     * Blurs out address, amount and message text fields
     * @method blurTextFields
     */
    blurTextFields() {
        this.addressField.blur();
        this.amountField.blur();
        this.messageField.blur();
    }

    render() {
        const { maxPressed, maxColor, maxText, sending } = this.state;
        const { t, isSendingTransfer, address, amount, message, denomination, theme, isKeyboardActive } = this.props;
        const textColor = { color: theme.body.color };
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
                            onValidTextChange={(text) => {
                                if (text.match(VALID_SEED_REGEX) || text.length === 0) {
                                    this.props.setSendAddressField(text);
                                }
                            }}
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
                        />
                        <View style={{ flex: 0.17 }} />
                        <AmountTextInput
                            label={t('amount')}
                            amount={amount}
                            denomination={denomination}
                            multiplier={this.getUnitMultiplier()}
                            editable={!isSending}
                            setAmount={(text) => this.props.setSendAmountField(text)}
                            setDenomination={(text) => {
                                this.props.setSendDenomination(text);
                                this.resetMaxPressed();
                            }}
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
                                { opacity: opacity, flex: isAndroid ? (isKeyboardActive ? 0.8 : 0.25) : 0.25 },
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
                                        bodyColor={theme.body.color}
                                        primaryColor={theme.primary.color}
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 0.03 }} />
                        <CustomTextInput
                            onRef={(c) => {
                                this.messageField = c;
                            }}
                            keyboardType="default"
                            label={t('message')}
                            onValidTextChange={(text) => this.props.setSendMessageField(text)}
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="done"
                            blurOnSubmit
                            onSubmitEditing={() => Keyboard.dismiss()}
                            theme={theme}
                            value={message}
                            editable={!isSending}
                            selectTextOnFocus={!isSending}
                            multiplier={this.getUnitMultiplier()}
                        />
                        <View style={{ flex: 0.1 }} />
                    </View>
                    <View style={styles.bottomContainer}>
                        <View style={{ flex: 0.25 }} />
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <SendProgressBar
                                activeStepIndex={this.props.activeStepIndex}
                                totalSteps={size(this.props.activeSteps)}
                                filledColor={theme.input.bg}
                                unfilledColor={theme.dark.color}
                                textColor={theme.body.color}
                                preSwipeColor={theme.secondary.color}
                                postSwipeColor={theme.primary.color}
                                interupt={this.state.shouldInteruptSendAnimation}
                                progressText={this.getProgressBarText()}
                                staticText={t('swipeToSend')}
                                onSwipeSuccess={() => {
                                    this.onSendPress();
                                    if (address === '' && amount === '' && message && '') {
                                        this.blurTextFields();
                                    }
                                }}
                                t={t}
                            />
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ flex: 0.33 }} />
                            <TouchableOpacity
                                onPress={() => this.showModal('unitInfo')}
                                hitSlop={{ top: width / 30, bottom: width / 30, left: width / 30, right: width / 30 }}
                            >
                                <View style={styles.info}>
                                    <Icon
                                        name="info"
                                        size={width / 22}
                                        color={theme.body.color}
                                        style={{ marginRight: width / 60 }}
                                    />
                                    <Text style={[styles.infoText, textColor]}>{t('iotaUnits')}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 0.3 }} />
                    </View>
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
    selectedAccountMeta: getSelectedAccountMeta(state),
    isSyncing: state.ui.isSyncing,
    isSendingTransfer: state.ui.isSendingTransfer,
    seedIndex: state.wallet.seedIndex,
    conversionRate: state.settings.conversionRate,
    usdPrice: state.marketData.usdPrice,
    isGettingSensitiveInfoToMakeTransaction: state.keychain.isGettingSensitiveInfo.send.makeTransaction,
    theme: getThemeFromState(state),
    isTransitioning: state.ui.isTransitioning,
    address: state.ui.sendAddressFieldText,
    amount: state.ui.sendAmountFieldText,
    message: state.ui.sendMessageFieldText,
    denomination: state.ui.sendDenomination,
    activeStepIndex: state.progress.activeStepIndex,
    activeSteps: state.progress.activeSteps,
    deepLinkActive: state.wallet.deepLinkActive,
    isFingerprintEnabled: state.settings.isFingerprintEnabled,
    isKeyboardActive: state.ui.isKeyboardActive,
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

export default withNamespaces(['send', 'global'])(connect(mapStateToProps, mapDispatchToProps)(Send));
