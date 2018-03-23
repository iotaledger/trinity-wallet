import isFunction from 'lodash/isFunction';
import size from 'lodash/size';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
    NativeModules,
} from 'react-native';
import { connect } from 'react-redux';
import { isValidAddress, isValidMessage, isValidAmount } from 'iota-wallet-shared-modules/libs/iota/utils';
import { getCurrencySymbol } from 'iota-wallet-shared-modules/libs/currency';
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
} from 'iota-wallet-shared-modules/actions/ui';
import { parse, round } from 'iota-wallet-shared-modules/libs/utils';
import { VALID_ADDRESS_WITH_CHECKSUM_REGEX, VALID_SEED_REGEX } from 'iota-wallet-shared-modules/libs/iota';
import { getBalanceForSelectedAccount, getSelectedAccountName } from 'iota-wallet-shared-modules/selectors/accounts';
import { reset as resetProgress, startTrackingProgress } from 'iota-wallet-shared-modules/actions/progress';
import { generateAlert, generateTransferErrorAlert } from 'iota-wallet-shared-modules/actions/alerts';
import Modal from 'react-native-modal';
import KeepAwake from 'react-native-keep-awake';
import QRScanner from '../components/QrScanner';
import Toggle from '../components/Toggle';
import ProgressBar from '../components/ProgressBar';
import ProgressSteps from '../utils/progressSteps';
import { getSeedFromKeychain } from '../utils/keychain';
import TransferConfirmationModal from '../components/TransferConfirmationModal';
import UnitInfoModal from '../components/UnitInfoModal';
import CustomTextInput from '../components/CustomTextInput';
import CtaButton from '../components/CtaButton';
import { Icon } from '../theme/icons.js';
import { width } from '../utils/dimensions';
import { isAndroid, isIOS } from '../utils/device';

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
    fieldContainer: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        flex: 0.7,
    },
    maxContainer: {
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        width: width / 1.2,
        paddingRight: 1,
        flex: 0.8,
    },
    messageFieldContainer: {
        flex: 0.7,
        justifyContent: 'flex-start',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'white',
    },
    maxButtonText: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 31.8,
        backgroundColor: 'transparent',
        marginRight: width / 50,
    },
    infoText: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 29.6,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    info: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressSummaryText: {
        fontSize: width / 30.9,
    },
});

export class Send extends Component {
    static propTypes = {
        t: PropTypes.func.isRequired,
        currency: PropTypes.string.isRequired,
        balance: PropTypes.number.isRequired,
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
        resetProgress: PropTypes.func.isRequired,
        startTrackingProgress: PropTypes.func.isRequired,
        denomination: PropTypes.string.isRequired,
        activeStepIndex: PropTypes.number.isRequired,
        activeSteps: PropTypes.array.isRequired,
        timeTakenByEachProgressStep: PropTypes.array.isRequired,
        password: PropTypes.string.isRequired,
        generateTransferErrorAlert: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        const { t, body } = this.props;

        this.state = {
            selectedSetting: '', // eslint-disable-line react/no-unused-state
            modalContent: '',
            maxPressed: false,
            maxColor: body.color,
            maxText: t('send:sendMax'),
            sending: false,
            currencySymbol: getCurrencySymbol(this.props.currency),
        };
    }

    componentWillMount() {
        const { t, balance, amount, primary } = this.props;
        const amountAsNumber = parseFloat(amount);

        if (amountAsNumber === balance / this.getUnitMultiplier() && amountAsNumber !== 0) {
            this.setState({
                maxPressed: true,
                maxColor: primary.color,
                maxText: t('send:maximumSelected'),
            });
        }
    }

    componentDidMount() {
        if (!this.props.isSendingTransfer) {
            this.props.resetProgress();
        }
    }

    componentWillReceiveProps(newProps) {
        const { seedIndex, isSendingTransfer } = this.props;

        if (!isSendingTransfer && newProps.isSendingTransfer) {
            KeepAwake.activate();
        } else if (isSendingTransfer && !newProps.isSendingTransfer) {
            KeepAwake.deactivate();
            this.setState({ sending: false });

            // Reset toggle switch in case maximum was on
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

    onDenominationPress() {
        const { body, denomination } = this.props;
        const { currencySymbol } = this.state;
        const availableDenominations = ['i', 'Ki', 'Mi', 'Gi', 'Ti', currencySymbol];
        const indexOfDenomination = availableDenominations.indexOf(denomination);
        const nextDenomination =
            indexOfDenomination === -1 || indexOfDenomination === 5
                ? availableDenominations[0]
                : availableDenominations[indexOfDenomination + 1];

        this.props.setSendDenomination(nextDenomination);

        this.setState({
            maxPressed: false,
            maxColor: body.color,
        });
    }

    onMaxPress() {
        const { sending, maxPressed } = this.state;
        const { t, body, primary, balance } = this.props;
        const max = (balance / this.getUnitMultiplier()).toString();

        if (sending) {
            return;
        }

        if (balance === 0) {
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
        const { t, body } = this.props;
        amount = amount.replace(/,/g, '.');
        this.props.setSendAmountField(amount);

        if (amount === (this.props.balance / this.getUnitMultiplier()).toString()) {
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
        const { t, amount, address, message, denomination } = this.props;
        const { currencySymbol } = this.state;

        const multiplier = this.getUnitMultiplier();
        const isFiat = denomination === currencySymbol;

        const enoughBalance = this.enoughBalance();
        const messageIsValid = isValidMessage(message);
        const addressIsValid = isValidAddress(address);
        const amountIsValid = isValidAmount(amount, multiplier, isFiat);

        if (!addressIsValid) {
            return this.getInvalidAddressError(address);
        }

        if (!amountIsValid) {
            return this.props.generateAlert('error', t('invalidAmount'), t('invalidAmountExplanation'));
        }

        if (!enoughBalance) {
            return this.props.generateAlert('error', t('notEnoughFunds'), t('notEnoughFundsExplanation'));
        }

        if (!messageIsValid) {
            return this.props.generateAlert('error', t('invalidMessage'), t('invalidMessageExplanation'));
        }

        return this.openModal('transferConfirmation');
    }

    onQRRead(data) {
        const dataString = data.toString();
        const { t } = this.props;
        if (dataString.match(/{/)) {
            // For codes containing JSON (iotaledger and Trinity)
            const parsedData = parse(data);
            this.props.setSendAddressField(parsedData.address);

            if (data.message) {
                this.props.setSendMessageField(data.message);
            }
        } else if (dataString.match(/iota:/)) {
            // For codes with iota: at the front (TheTangle.org)
            const dataSubstring = data.substring(5);
            this.props.setSendAddressField(dataSubstring);
        } else if (dataString.match(VALID_ADDRESS_WITH_CHECKSUM_REGEX)) {
            // For codes with plain text (Bitfinex, Binance, and IOTASear.ch)
            this.props.setSendAddressField(data);
        } else {
            this.props.generateAlert('error', t('invalidAddress'), t('invalidAmountExplanationGeneric'));
        }

        this.hideModal();
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

    setModalContent(selectedSetting) {
        let modalContent;
        const { bar, body, primary, address, amount } = this.props;

        switch (selectedSetting) {
            case 'qrScanner':
                modalContent = (
                    <QRScanner
                        onQRRead={(data) => this.onQRRead(data)}
                        hideModal={() => this.hideModal()}
                        primary={primary}
                        body={body}
                    />
                );
                break;
            case 'transferConfirmation':
                modalContent = (
                    <TransferConfirmationModal
                        value={parseFloat(amount) * this.getUnitMultiplier()}
                        amount={amount}
                        conversionText={this.getConversionTextIota()}
                        address={address}
                        sendTransfer={() => this.sendTransfer()}
                        hideModal={(callback) => this.hideModal(callback)}
                        body={body}
                        borderColor={{ borderColor: body.color }}
                        textColor={{ color: body.color }}
                        setSendingTransferFlag={() => this.setSendingTransferFlag()}
                    />
                );
                break;
            case 'unitInfo':
                modalContent = (
                    <UnitInfoModal
                        hideModal={() => this.hideModal()}
                        textColor={{ color: bar.color }}
                        borderColor={{ borderColor: bar.color }}
                        bar={bar}
                    />
                );
                break;
            default:
                break;
        }

        this.setState({ modalContent });
    }

    getUnitMultiplier() {
        const { usdPrice, conversionRate, denomination } = this.props;
        const { currencySymbol } = this.state;
        let multiplier = 1;
        switch (denomination) {
            case 'i':
                break;
            case 'Ki':
                multiplier = 1000;
                break;
            case 'Mi':
                multiplier = 1000000;
                break;
            case 'Gi':
                multiplier = 1000000000;
                break;
            case 'Ti':
                multiplier = 1000000000000;
                break;
            case currencySymbol:
                multiplier = 1000000 / usdPrice / conversionRate;
                break;
            default:
                break;
        }

        return multiplier;
    }

    setSendingTransferFlag() {
        this.setState({ sending: true });
    }

    getConversionTextFiat() {
        const { amount, usdPrice, conversionRate } = this.props;

        if (this.shouldConversionTextShowInvalid()) {
            return 'INVALID';
        }

        const convertedValue = round(amount / usdPrice / conversionRate, 10);
        let conversionText = '';
        if (convertedValue > 0 && convertedValue < 0.01) {
            conversionText = '< 0.01 Mi';
        } else if (convertedValue >= 0.01) {
            conversionText = `= ${convertedValue.toFixed(2)} Mi`;
        }
        return conversionText;
    }

    getConversionTextIota() {
        const { amount, usdPrice, conversionRate } = this.props;
        const { currencySymbol } = this.state;

        if (this.shouldConversionTextShowInvalid()) {
            return 'INVALID';
        }

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

    getOpacity() {
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

    openModal(selectedSetting) {
        this.setModalContent(selectedSetting);
        this.setState({ selectedSetting }); // eslint-disable-line react/no-unused-state
        this.showModal();
    }

    shouldConversionTextShowInvalid() {
        const { amount, denomination } = this.props;
        const { currencySymbol } = this.state;
        const multiplier = this.getUnitMultiplier();
        const isFiat = denomination === currencySymbol;
        const amountIsValid = isValidAmount(amount, multiplier, isFiat);

        return !amountIsValid && amount !== '';
    }

    showModal = () => this.setState({ isModalVisible: true });

    hideModal = (callback) =>
        this.setState({ isModalVisible: false }, () => {
            const callable = (fn) => isFunction(fn);

            if (callable(callback)) {
                setTimeout(callback);
            }
        });

    enoughBalance() {
        const { amount, balance } = this.props;
        const multiplier = this.getUnitMultiplier();

        if (parseFloat(amount) * multiplier > balance) {
            return false;
        }

        return true;
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

                let powFn = null;
                let genFn = null;

                if (isAndroid) {
                    powFn = NativeModules.PoWModule.doPoW;
                } else if (isIOS) {
                    powFn = NativeModules.Iota.doPoW;
                    genFn = NativeModules.Iota.address;
                }

                return this.props.makeTransaction(seed, address, value, message, selectedAccountName, powFn, genFn);
            })
            .catch((error) => {
                this.props.getFromKeychainError('send', 'makeTransaction');
                this.props.generateTransferErrorAlert(error);
            });
    }

    renderModalContent = () => <View>{this.state.modalContent}</View>;

    renderProgressBarChildren() {
        const { activeStepIndex, activeSteps } = this.props;
        const totalSteps = size(activeSteps);

        if (activeStepIndex === totalSteps) {
            return this.getProgressSummary();
        }

        return activeSteps[activeStepIndex] ? activeSteps[activeStepIndex] : null;
    }

    render() {
        const { isModalVisible, maxPressed, maxColor, maxText, sending, currencySymbol } = this.state;
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
        } = this.props;
        const textColor = { color: body.color };
        const conversionText =
            denomination === currencySymbol ? this.getConversionTextFiat() : this.getConversionTextIota();
        const opacity = this.getOpacity();

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
                            onChangeText={(text) => this.props.setSendAddressField(text)}
                            containerStyle={{ width: width / 1.2 }}
                            autoCapitalize="characters"
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="next"
                            onSubmitEditing={() => this.amountField.focus()}
                            widget="qr"
                            onQRPress={() => this.openModal('qrScanner')}
                            theme={theme}
                            value={address}
                            editable={!sending}
                            selectTextOnFocus={!sending}
                        />
                        <View style={{ flex: 0.17 }} />
                        <View style={styles.fieldContainer}>
                            <CustomTextInput
                                onRef={(c) => {
                                    this.amountField = c;
                                }}
                                keyboardType="numeric"
                                label={t('amount')}
                                onChangeText={(text) => this.onAmountType(text)}
                                containerStyle={{ width: width / 1.2 }}
                                autoCorrect={false}
                                enablesReturnKeyAutomatically
                                returnKeyType="next"
                                onSubmitEditing={() => this.messageField.focus()}
                                widget="denomination"
                                conversionText={conversionText}
                                currencyConversion
                                theme={theme}
                                denominationText={denomination}
                                onDenominationPress={() => this.onDenominationPress()}
                                value={amount}
                                editable={!sending}
                                selectTextOnFocus={!sending}
                            />
                            <View style={{ flex: 0.2 }} />
                            <View style={[styles.maxContainer, { opacity: opacity }]}>
                                <TouchableOpacity onPress={() => this.onMaxPress()}>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'flex-start',
                                        }}
                                    >
                                        <Text style={[styles.maxButtonText, { color: maxColor }]}>{maxText}</Text>
                                        <Toggle
                                            active={maxPressed}
                                            bodyColor={body.color}
                                            primaryColor={primary.color}
                                        />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <CustomTextInput
                            onRef={(c) => {
                                this.messageField = c;
                            }}
                            keyboardType="default"
                            label={t('message')}
                            onChangeText={(text) => this.props.setSendMessageField(text)}
                            containerStyle={{ width: width / 1.2 }}
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="send"
                            blurOnSubmit
                            onSubmitEditing={() => this.onSendPress()}
                            theme={theme}
                            value={message}
                            editable={!sending}
                            selectTextOnFocus={!sending}
                        />
                    </View>
                    <View style={styles.bottomContainer}>
                        <View style={{ flex: 0.25 }} />
                        {!isSendingTransfer &&
                            !isGettingSensitiveInfoToMakeTransaction && (
                                <View style={{ flex: 1 }}>
                                    <CtaButton
                                        ctaColor={primary.color}
                                        ctaBorderColor={primary.hover}
                                        secondaryCtaColor={primary.body}
                                        text={t('send')}
                                        onPress={() => {
                                            this.onSendPress();
                                            if (address === '' && amount === '' && message && '') {
                                                this.addressField.blur();
                                                this.amountField.blur();
                                                this.messageField.blur();
                                            }
                                        }}
                                    />
                                </View>
                            )}
                        {(isGettingSensitiveInfoToMakeTransaction || isSendingTransfer) &&
                            !isModalVisible && (
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
                                onPress={() => this.openModal('unitInfo')}
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
                    <Modal
                        animationIn="bounceInUp"
                        animationOut="bounceOut"
                        animationInTiming={1000}
                        animationOutTiming={200}
                        backdropTransitionInTiming={500}
                        backdropTransitionOutTiming={200}
                        backdropColor={body.bg}
                        style={{ alignItems: 'center', margin: 0 }}
                        isVisible={isModalVisible}
                        onBackButtonPress={() => this.setState({ isModalVisible: false })}
                        useNativeDriver
                        hideModalContentWhileAnimating
                    >
                        {this.renderModalContent()}
                    </Modal>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    currency: state.settings.currency,
    balance: getBalanceForSelectedAccount(state),
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
    resetProgress,
    startTrackingProgress,
    generateTransferErrorAlert,
};

export default translate(['send', 'global'])(connect(mapStateToProps, mapDispatchToProps)(Send));
