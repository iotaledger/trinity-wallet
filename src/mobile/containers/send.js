import get from 'lodash/get';
import isFunction from 'lodash/isFunction';
import size from 'lodash/size';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { iota } from 'iota-wallet-shared-modules/libs/iota';
import {
    ActivityIndicator,
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
    ListView,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { connect } from 'react-redux';
import {
    round,
    VALID_SEED_REGEX,
    ADDRESS_LENGTH,
    VALID_ADDRESS_WITH_CHECKSUM_REGEX,
} from 'iota-wallet-shared-modules/libs/util';
import { getCurrencySymbol } from 'iota-wallet-shared-modules/libs/currency';
import blackInfoImagePath from 'iota-wallet-shared-modules/images/info-black.png';
import whiteInfoImagePath from 'iota-wallet-shared-modules/images/info-white.png';
import {
    getFromKeychainRequest,
    getFromKeychainSuccess,
    getFromKeychainError,
} from 'iota-wallet-shared-modules/actions/keychain';
import { prepareTransfer } from 'iota-wallet-shared-modules/actions/tempAccount';
import {
    setSendAddressField,
    setSendAmountField,
    setSendMessageField,
    clearSendFields,
    setSendDenomination,
} from 'iota-wallet-shared-modules/actions/ui';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import Modal from 'react-native-modal';
import KeepAwake from 'react-native-keep-awake';
import whiteSendToggleOffImagePath from 'iota-wallet-shared-modules/images/send-toggle-off-white.png';
import whiteSendToggleOnImagePath from 'iota-wallet-shared-modules/images/send-toggle-on-white.png';
import blackSendToggleOnImagePath from 'iota-wallet-shared-modules/images/send-toggle-on-black.png';
import blackSendToggleOffImagePath from 'iota-wallet-shared-modules/images/send-toggle-off-black.png';
import QRScanner from '../components/qrScanner';
import {
    getBalanceForSelectedAccountViaSeedIndex,
    getSelectedAccountNameViaSeedIndex,
} from '../../shared/selectors/account';
import keychain, { getSeed } from '../util/keychain';
import TransferConfirmationModal from '../components/transferConfirmationModal';
import UnitInfoModal from '../components/unitInfoModal';
import CustomTextInput from '../components/customTextInput';
import CtaButton from '../components/ctaButton';
import { width, height } from '../util/dimensions';

let currencySymbol = '';

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: height / 14,
    },
    topContainer: {
        flex: 3.6,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    bottomContainer: {
        flex: 2.1,
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
    infoIcon: {
        width: width / 25,
        height: width / 25,
        marginRight: width / 60,
    },
    info: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
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
        prepareTransfer: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        getFromKeychainRequest: PropTypes.func.isRequired,
        getFromKeychainSuccess: PropTypes.func.isRequired,
        getFromKeychainError: PropTypes.func.isRequired,
        closeTopBar: PropTypes.func.isRequired,
        ctaColor: PropTypes.string.isRequired,
        backgroundColor: PropTypes.string.isRequired,
        barColor: PropTypes.string.isRequired,
        negativeColor: PropTypes.string.isRequired,
        isSendingTransfer: PropTypes.bool.isRequired,
        secondaryCtaColor: PropTypes.string.isRequired,
        secondaryBarColor: PropTypes.string.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        ctaBorderColor: PropTypes.string.isRequired,
        isTransitioning: PropTypes.bool.isRequired,
        address: PropTypes.string.isRequired,
        amount: PropTypes.string.isRequired,
        message: PropTypes.string.isRequired,
        setSendAddressField: PropTypes.func.isRequired,
        setSendAmountField: PropTypes.func.isRequired,
        setSendMessageField: PropTypes.func.isRequired,
        clearSendFields: PropTypes.func.isRequired,
        setSendDenomination: PropTypes.func.isRequired,
        denomination: PropTypes.string.isRequired,
    };

    static isValidAddress(address) {
        if (Send.isValidAddressChars(address) !== null) {
            return size(address) === 90 && iota.utils.isValidChecksum(address);
        }
        return false;
    }

    static isValidAddressChars(address) {
        return address.match(VALID_SEED_REGEX);
    }

    static isValidAmount(amount, multiplier) {
        const value = parseFloat(amount);
        if (value < 0) {
            return false;
        }
        if (value > 0 && value < 1) {
            return false;
        }
        if (!Number.isInteger(value * multiplier)) {
            return false;
        }
        return !isNaN(value);
    }

    constructor(props) {
        super(props);

        const { t } = this.props;

        this.state = {
            dataSource: ds.cloneWithRows([]),
            selectedSetting: '',
            modalContent: '',
            maxPressed: false,
            maxColor: props.secondaryBackgroundColor,
            maxText: t('send:sendMax'),
            sending: false,
        };
    }

    componentWillMount() {
        const { t, currency, balance, amount, ctaColor } = this.props;
        currencySymbol = getCurrencySymbol(currency);
        if (amount === (balance / this.getUnitMultiplier()).toString()) {
            this.setState({
                maxPressed: true,
                maxColor: ctaColor,
                maxText: t('send:maximumSelected'),
            });
        }
    }

    componentWillReceiveProps(newProps) {
        if (!this.props.isSendingTransfer && newProps.isSendingTransfer) {
            KeepAwake.activate();
        } else if (this.props.isSendingTransfer && !newProps.isSendingTransfer) {
            KeepAwake.deactivate();
            this.props.clearSendFields();
            this.props.setSendDenomination('i');
            this.setState({ sending: false });

            // Reset toggle switch in case maximum was on
            this.resetToggleSwitch();
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

    onDenominationPress() {
        const { secondaryBackgroundColor, denomination } = this.props;
        const availableDenominations = ['i', 'Ki', 'Mi', 'Gi', 'Ti', currencySymbol];
        const indexOfDenomination = availableDenominations.indexOf(denomination);
        const nextDenomination =
            indexOfDenomination === -1
                ? availableDenominations[indexOfDenomination + 2]
                : availableDenominations[indexOfDenomination + 1];
        this.props.setSendDenomination(nextDenomination);
        this.setState({
            maxPressed: false,
            maxColor: secondaryBackgroundColor,
        });
    }

    onMaxPress() {
        const { sending, maxPressed } = this.state;
        const { t, ctaColor, secondaryBackgroundColor } = this.props;
        const max = (this.props.balance / this.getUnitMultiplier()).toString();
        if (sending) {
            return;
        }
        if (maxPressed) {
            this.props.setSendAmountField('');
            this.setState({
                maxPressed: false,
                maxColor: secondaryBackgroundColor,
                maxText: t('send:sendMax'),
            });
        } else {
            this.props.setSendAmountField(max);
            this.setState({
                maxPressed: true,
                maxColor: ctaColor,
                maxText: t('send:maximumSelected'),
            });
        }
    }

    onAmountType(amount) {
        const { t } = this.props;
        if (amount === (this.props.balance / this.getUnitMultiplier()).toString()) {
            this.onMaxPress();
        } else {
            this.props.setSendAmountField(amount);
            this.setState({
                maxPressed: false,
                maxColor: this.props.secondaryBackgroundColor,
                maxText: t('send:sendMax'),
            });
        }
    }

    onSendPress() {
        const { t, amount, address } = this.props;
        const multiplier = this.getUnitMultiplier();

        const addressIsValid = Send.isValidAddress(address);
        const enoughBalance = this.enoughBalance();
        const amountIsValid = Send.isValidAmount(amount, multiplier);
        const addressCharsAreValid = Send.isValidAddressChars(address);
        if (addressIsValid && enoughBalance && amountIsValid && addressCharsAreValid) {
            return this.showModal();
        }

        if (!enoughBalance) {
            return this.props.generateAlert('error', t('notEnoughFunds'), t('notEnoughFundsExplanation'));
        }

        if (!addressIsValid) {
            this.renderInvalidAddressErrors(address);
        }

        if (!amountIsValid) {
            return this.props.generateAlert('error', t('invalidAmount'), t('invalidAmountExplanation'));
        }
    }

    onQRRead(data) {
        const dataString = data.toString();
        if (dataString.match(/{/)) {
            // For codes containing JSON (iotaledger and Trinity)
            const parsedData = JSON.parse(data);
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
            this.props.generateAlert(
                'error',
                'Incorrect address format',
                'Valid addresses should be 90 characters and contain only A-Z or 9.',
            );
        }
        this.hideModal();
    }

    setModalContent(selectedSetting) {
        let modalContent;
        const {
            secondaryBackgroundColor,
            secondaryBarColor,
            barColor,
            backgroundColor,
            ctaColor,
            secondaryCtaColor,
            ctaBorderColor,
            address,
            amount,
            denomination,
        } = this.props;
        switch (selectedSetting) {
            case 'qrScanner':
                modalContent = (
                    <QRScanner
                        onQRRead={(data) => this.onQRRead(data)}
                        hideModal={() => this.hideModal()}
                        backgroundColor={backgroundColor}
                        ctaColor={ctaColor}
                        secondaryCtaColor={secondaryCtaColor}
                        ctaBorderColor={ctaBorderColor}
                        secondaryBackgroundColor={secondaryBackgroundColor}
                    />
                );
                this.setState({
                    selectedSetting,
                    modalContent,
                });
                this.showModal();
                break;
            case 'transferConfirmation':
                modalContent = (
                    <TransferConfirmationModal
                        amount={amount}
                        denomination={denomination}
                        address={address}
                        sendTransfer={() => this.sendTransfer()}
                        hideModal={(callback) => this.hideModal(callback)}
                        backgroundColor={backgroundColor}
                        borderColor={{ borderColor: secondaryBackgroundColor }}
                        textColor={{ color: secondaryBackgroundColor }}
                        setSendingTransferFlag={() => this.setSendingTransferFlag()}
                    />
                );
                this.setState({
                    selectedSetting,
                    modalContent,
                });
                this.onSendPress();
                break;
            case 'unitInfo':
                modalContent = (
                    <UnitInfoModal
                        backgroundColor={barColor}
                        hideModal={() => this.hideModal()}
                        textColor={{ color: secondaryBarColor }}
                        borderColor={{ borderColor: secondaryBarColor }}
                        secondaryBarColor={secondaryBarColor}
                    />
                );
                this.setState({
                    selectedSetting,
                    modalContent,
                });
                this.showModal();
                break;
            default:
                break;
        }
    }

    getUnitMultiplier() {
        const { usdPrice, conversionRate, denomination } = this.props;
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
        const convertedValue = round(
            parseFloat(Send.isValidAmount(amount) ? amount : 0) *
                usdPrice /
                1000000 *
                this.getUnitMultiplier() *
                conversionRate,
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

    clearInteractions() {
        this.props.closeTopBar();
        Keyboard.dismiss();
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
        if (parseFloat(amount) * this.getUnitMultiplier() > balance) {
            return false;
        }
        return true;
    }

    sendTransfer() {
        const { t, seedIndex, selectedAccountName, isSyncing, isTransitioning, message, amount, address } = this.props;

        if (isSyncing) {
            this.props.generateAlert('error', t('global:syncInProgress'), t('global:syncInProgressExplanation'));
            return;
        }

        if (isTransitioning) {
            this.props.generateAlert(
                'error',
                t('Snapshot transition in progress'),
                t('Please wait until the transition is complete.'),
            );
            return;
        }

        const value = parseInt(parseFloat(amount) * this.getUnitMultiplier(), 10);
        this.props.getFromKeychainRequest('send', 'makeTransaction');
        keychain
            .get()
            .then((credentials) => {
                this.props.getFromKeychainSuccess('send', 'makeTransaction');

                if (get(credentials, 'data')) {
                    const seed = getSeed(credentials.data, seedIndex);
                    this.props.prepareTransfer(seed, address, value, message, selectedAccountName);
                }
            })
            .catch(() => this.props.getFromKeychainError('send', 'makeTransaction'));
    }

    renderInvalidAddressErrors(address) {
        const { t } = this.props;
        const props = ['error', t('invalidAddress')];

        if (size(address) !== 90) {
            return this.props.generateAlert(...props, t('invalidAddressExplanation1', { maxLength: ADDRESS_LENGTH }));
        } else if (address.match(VALID_SEED_REGEX) === null) {
            return this.props.generateAlert(...props, t('invalidAddressExplanation2'));
        }

        return this.props.generateAlert(...props, t('invalidAddressExplanation3'));
    }

    renderModalContent = () => <View>{this.state.modalContent}</View>;

    render() {
        const { isModalVisible, maxColor, maxText, sending, maxPressed } = this.state;
        const {
            t,
            ctaColor,
            backgroundColor,
            negativeColor,
            secondaryBackgroundColor,
            secondaryCtaColor,
            ctaBorderColor,
            isSendingTransfer,
            isGettingSensitiveInfoToMakeTransaction,
            address,
            amount,
            message,
            denomination,
        } = this.props;
        const textColor = { color: secondaryBackgroundColor };
        const infoImagePath = secondaryBackgroundColor === 'white' ? whiteInfoImagePath : blackInfoImagePath;
        const sendToggleOnImagePath =
            secondaryBackgroundColor === 'white' ? whiteSendToggleOnImagePath : blackSendToggleOnImagePath;
        const sendToggleOffImagePath =
            secondaryBackgroundColor === 'white' ? whiteSendToggleOffImagePath : blackSendToggleOffImagePath;
        const sendToggleImagePath = maxPressed ? sendToggleOnImagePath : sendToggleOffImagePath;
        const conversionText =
            denomination === currencySymbol ? this.getConversionTextFiat() : this.getConversionTextIota();

        return (
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => this.clearInteractions()}>
                <View style={styles.container}>
                    <View style={{ flex: 0.25 }} />
                    <View style={styles.topContainer}>
                        <CustomTextInput
                            onRef={(c) => {
                                this.addressField = c;
                            }}
                            maxLength={90}
                            label={t('recipientAddress')}
                            onChangeText={(text) => this.props.setSendAddressField(text)}
                            containerStyle={{ width: width / 1.2 }}
                            autoCapitalize={'characters'}
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="next"
                            onSubmitEditing={() => this.amountField.focus()}
                            widget="qr"
                            onQRPress={() => this.setModalContent('qrScanner')}
                            secondaryBackgroundColor={secondaryBackgroundColor}
                            negativeColor={negativeColor}
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
                                keyboardType={'numeric'}
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
                                secondaryBackgroundColor={secondaryBackgroundColor}
                                negativeColor={negativeColor}
                                denominationText={denomination}
                                onDenominationPress={() => this.onDenominationPress()}
                                value={amount}
                                editable={!sending}
                                selectTextOnFocus={!sending}
                            />
                            <View style={{ flex: 0.2 }} />
                            <View style={styles.maxContainer}>
                                <TouchableOpacity onPress={() => this.onMaxPress()}>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'flex-start',
                                        }}
                                    >
                                        <Text style={[styles.maxButtonText, { color: maxColor }]}>{maxText}</Text>
                                        <Image
                                            style={[
                                                {
                                                    width: width / 12,
                                                    height: width / 12,
                                                },
                                            ]}
                                            source={sendToggleImagePath}
                                        />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <CustomTextInput
                            onRef={(c) => {
                                this.messageField = c;
                            }}
                            keyboardType={'default'}
                            label={t('message')}
                            onChangeText={(text) => this.props.setSendMessageField(text)}
                            containerStyle={{ width: width / 1.2 }}
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="send"
                            blurOnSubmit
                            onSubmitEditing={() => this.setModalContent('transferConfirmation')}
                            secondaryBackgroundColor={secondaryBackgroundColor}
                            negativeColor={negativeColor}
                            value={message}
                            editable={!sending}
                            selectTextOnFocus={!sending}
                        />
                    </View>
                    <View style={styles.bottomContainer}>
                        <View style={{ flex: 0.3 }} />
                        {!isSendingTransfer &&
                            !isGettingSensitiveInfoToMakeTransaction && (
                                <CtaButton
                                    ctaColor={ctaColor}
                                    ctaBorderColor={ctaBorderColor}
                                    secondaryCtaColor={secondaryCtaColor}
                                    text={t('send')}
                                    onPress={() => {
                                        this.setModalContent('transferConfirmation');
                                        if (address === '' && amount === '' && message && '') {
                                            this.addressField.blur();
                                            this.amountField.blur();
                                            this.messageField.blur();
                                        }
                                    }}
                                />
                            )}
                        {(isGettingSensitiveInfoToMakeTransaction || isSendingTransfer) &&
                            !isModalVisible && (
                                <View style={{ height: height / 14 }}>
                                    <ActivityIndicator
                                        animating={
                                            (isGettingSensitiveInfoToMakeTransaction || isSendingTransfer) &&
                                            !isModalVisible
                                        }
                                        style={styles.activityIndicator}
                                        size="large"
                                        color={negativeColor}
                                    />
                                </View>
                            )}
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableOpacity
                                onPress={() => this.setModalContent('unitInfo')}
                                hitSlop={{ top: width / 30, bottom: width / 30, left: width / 30, right: width / 30 }}
                            >
                                <View style={styles.info}>
                                    <Image source={infoImagePath} style={styles.infoIcon} />
                                    <Text style={[styles.infoText, textColor]}>{t('iotaUnits')}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Modal
                        animationIn={'bounceInUp'}
                        animationOut={'bounceOut'}
                        animationInTiming={1000}
                        animationOutTiming={200}
                        backdropTransitionInTiming={500}
                        backdropTransitionOutTiming={200}
                        backdropColor={backgroundColor}
                        style={{ alignItems: 'center', margin: 0 }}
                        isVisible={isModalVisible}
                        onBackButtonPress={() => this.setState({ isModalVisible: false })}
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
    balance: getBalanceForSelectedAccountViaSeedIndex(state.tempAccount.seedIndex, state.account.accountInfo),
    selectedAccountName: getSelectedAccountNameViaSeedIndex(state.tempAccount.seedIndex, state.account.seedNames),
    isSyncing: state.tempAccount.isSyncing,
    isSendingTransfer: state.tempAccount.isSendingTransfer,
    seedIndex: state.tempAccount.seedIndex,
    conversionRate: state.settings.conversionRate,
    usdPrice: state.marketData.usdPrice,
    isGettingSensitiveInfoToMakeTransaction: state.keychain.isGettingSensitiveInfo.send.makeTransaction,
    ctaColor: state.settings.theme.ctaColor,
    backgroundColor: state.settings.theme.backgroundColor,
    barColor: state.settings.theme.barColor,
    negativeColor: state.settings.theme.negativeColor,
    secondaryBackgroundColor: state.settings.theme.secondaryBackgroundColor,
    secondaryBarColor: state.settings.theme.secondaryBarColor,
    secondaryCtaColor: state.settings.theme.secondaryCtaColor,
    ctaBorderColor: state.settings.theme.ctaBorderColor,
    isTransitioning: state.tempAccount.isTransitioning,
    address: state.ui.sendAddressFieldText,
    amount: state.ui.sendAmountFieldText,
    message: state.ui.sendMessageFieldText,
    denomination: state.ui.sendDenomination,
});

const mapDispatchToProps = {
    prepareTransfer,
    generateAlert,
    getFromKeychainRequest,
    getFromKeychainSuccess,
    getFromKeychainError,
    setSendAddressField,
    setSendAmountField,
    setSendMessageField,
    clearSendFields,
    setSendDenomination,
};

export default translate(['send', 'global'])(connect(mapStateToProps, mapDispatchToProps)(Send));
