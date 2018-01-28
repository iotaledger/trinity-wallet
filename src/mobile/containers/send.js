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
    parse,
    VALID_ADDRESS_WITH_CHECKSUM_REGEX,
} from 'iota-wallet-shared-modules/libs/util';
import { getCurrencySymbol } from 'iota-wallet-shared-modules/libs/currency';
import keychain, { getSeed } from '../util/keychain';
import {
    getFromKeychainRequest,
    getFromKeychainSuccess,
    getFromKeychainError,
} from 'iota-wallet-shared-modules/actions/keychain';
import { prepareTransfer } from 'iota-wallet-shared-modules/actions/tempAccount';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import {
    getBalanceForSelectedAccountViaSeedIndex,
    getSelectedAccountNameViaSeedIndex,
} from '../../shared/selectors/account';
import Modal from 'react-native-modal';
import QRScanner from '../components/qrScanner.js';
import TransferConfirmationModal from '../components/transferConfirmationModal';
import UnitInfoModal from '../components/unitInfoModal';
import { getAccountInfo } from 'iota-wallet-shared-modules/actions/account';
import GENERAL from '../theme/general';
import THEMES from '../theme/themes';
import KeepAwake from 'react-native-keep-awake';
import CustomTextInput from '../components/customTextInput';

import blackInfoImagePath from 'iota-wallet-shared-modules/images/info-black.png';
import whiteInfoImagePath from 'iota-wallet-shared-modules/images/info-white.png';
import { width, height } from '../util/dimensions';

let sentDenomination = '';
let currencySymbol = '';

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

class Send extends Component {
    static propTypes = {
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
        ctaColor: PropTypes.object.isRequired,
        backgroundColor: PropTypes.object.isRequired,
        barColor: PropTypes.object.isRequired,
        negativeColor: PropTypes.object.isRequired,
        isSendingTransfer: PropTypes.bool.isRequired,
        secondaryCtaColor: PropTypes.string.isRequired,
        ctaBorderColor: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            denomination: 'i',
            amount: '',
            address: '',
            message: '',
            dataSource: ds.cloneWithRows([]),
            selectedSetting: '',
            modalContent: '',
            maxPressed: false,
            maxColor: props.secondaryBackgroundColor,
            maxText: 'SEND MAX',
            sending: false,
        };
    }

    componentWillMount() {
        currencySymbol = getCurrencySymbol(this.props.currency);
    }

    componentWillReceiveProps(newProps) {
        if (!this.props.isSendingTransfer && newProps.isSendingTransfer) {
            KeepAwake.activate();
        } else if (this.props.isSendingTransfer && !newProps.isSendingTransfer) {
            KeepAwake.deactivate();
            this.setState({ message: '', amount: '', address: '', sending: false });
        }
    }

    setSendingTransferFlag() {
        this.setState({ sending: true });
    }

    onDenominationPress() {
        const { secondaryBackgroundColor } = this.props;
        const { denomination } = this.state;
        const availableDenominations = ['i', 'Ki', 'Mi', 'Gi', 'Ti', currencySymbol];
        const indexOfDenomination = availableDenominations.indexOf(denomination);
        const nextDenomination =
            indexOfDenomination === -1
                ? availableDenominations[indexOfDenomination + 2]
                : availableDenominations[indexOfDenomination + 1];
        this.setState({
            denomination: nextDenomination,
            maxPressed: false,
            maxColor: secondaryBackgroundColor,
        });
    }

    onMaxPress() {
        const { sending } = this.state;
        const max = (this.props.balance / this.getUnitMultiplier()).toString();
        if (!sending) {
            this.setState({
                amount: max,
                maxPressed: true,
                maxColor: '#FF6C69',
                maxText: 'MAXIMUM amount selected',
            });
        }
    }

    onAmountType(amount) {
        if (amount === (this.props.balance / this.getUnitMultiplier()).toString()) {
            this.onMaxPress();
        } else {
            this.setState({
                amount,
                maxPressed: false,
                maxColor: this.props.secondaryBackgroundColor,
                maxText: 'SEND MAX',
            });
        }
    }

    isValidAddress(address) {
        if (this.isValidAddressChars(address) !== null) {
            return size(address) === 90 && iota.utils.isValidChecksum(address);
        }
    }

    isValidAddressChars(address) {
        return address.match(VALID_SEED_REGEX);
    }

    isValidAmount(amount) {
        const value = parseFloat(amount);
        if (value < 0) {
            return false;
        }
        if (value > 0 && value < 1) {
            return false;
        }
        return !isNaN(value);
    }

    enoughBalance() {
        if (parseFloat(this.state.amount) * this.getUnitMultiplier() > this.props.balance) {
            return false;
        } else {
            return true;
        }
    }

    renderInvalidAddressErrors(address) {
        const { t, generateAlert } = this.props;
        const props = ['error', t('invalidAddress')];

        if (size(address) !== 90) {
            return generateAlert(...props, t('invalidAddressExplanation1', { maxLength: ADDRESS_LENGTH }));
        } else if (address.match(VALID_SEED_REGEX) === null) {
            return generateAlert(...props, t('invalidAddressExplanation2'));
        }

        return generateAlert(...props, t('invalidAddressExplanation3'));
    }

    onSendPress() {
        const { t } = this.props;
        const address = this.state.address;
        const amount = this.state.amount;

        const addressIsValid = this.isValidAddress(address);
        const enoughBalance = this.enoughBalance();
        const amountIsValid = this.isValidAmount(amount);
        const addressCharsAreValid = this.isValidAddressChars(address);
        if (addressIsValid && enoughBalance && amountIsValid && addressCharsAreValid) {
            return this._showModal();
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

    sendTransfer() {
        const { t, seedIndex, selectedAccountName, isSyncing } = this.props;

        if (isSyncing) {
            this.props.generateAlert('error', t('global:syncInProgress'), t('global:syncInProgressExplanation'));
            return;
        }

        sentDenomination = this.state.denomination;

        const address = this.state.address;
        const value = parseInt(parseFloat(this.state.amount) * this.getUnitMultiplier(), 10);

        const message = this.state.message;

        this.props.getFromKeychainRequest('send', 'makeTransaction');
        keychain
            .get()
            .then(credentials => {
                this.props.getFromKeychainSuccess('send', 'makeTransaction');

                if (get(credentials, 'data')) {
                    const seed = getSeed(credentials.data, seedIndex);
                    this.props.prepareTransfer(seed, address, value, message, selectedAccountName);
                }
            })
            .catch(() => this.props.getFromKeychainError('send', 'makeTransaction'));
    }

    getUnitMultiplier() {
        let multiplier = 1;
        switch (this.state.denomination) {
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
                multiplier = 1000000 / this.props.usdPrice / this.props.conversionRate;
                break;
        }
        return multiplier;
    }

    _showModal = () => this.setState({ isModalVisible: true });

    _hideModal = callback =>
        this.setState({ isModalVisible: false }, () => {
            const callable = fn => isFunction(fn);

            if (callable(callback)) {
                setTimeout(callback);
            }
        });

    _renderModalContent = () => <View>{this.state.modalContent}</View>;

    setModalContent(selectedSetting) {
        let modalContent;
        const { secondaryBackgroundColor, secondaryBarColor } = this.props;
        switch (selectedSetting) {
            case 'qrScanner':
                modalContent = (
                    <QRScanner
                        onQRRead={data => this.onQRRead(data)}
                        hideModal={() => this._hideModal()}
                        backgroundColor={THEMES.getHSL(this.props.backgroundColor)}
                        ctaColor={THEMES.getHSL(this.props.ctaColor)}
                        secondaryCtaColor={this.props.secondaryCtaColor}
                        ctaBorderColor={this.props.ctaBorderColor}
                    />
                );
                this.setState({
                    selectedSetting,
                    modalContent,
                });
                this._showModal();
                break;
            case 'transferConfirmation':
                modalContent = (
                    <TransferConfirmationModal
                        amount={this.state.amount}
                        denomination={this.state.denomination}
                        address={this.state.address}
                        sendTransfer={() => this.sendTransfer()}
                        hideModal={callback => this._hideModal(callback)}
                        backgroundColor={THEMES.getHSL(this.props.barColor)}
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
                        backgroundColor={THEMES.getHSL(this.props.barColor)}
                        hideModal={() => this._hideModal()}
                        textColor={{ color: secondaryBarColor }}
                        borderColor={{ borderColor: secondaryBarColor }}
                        secondaryBarColor={secondaryBarColor}
                    />
                );
                this.setState({
                    selectedSetting,
                    modalContent,
                });
                this._showModal();
                break;
        }
    }

    onQRRead(data) {
        const { generateAlert } = this.props;
        const dataString = data.toString();
        if (dataString.match(/{/)) {
            // For codes containing JSON (iotaledger and Trinity)
            data = JSON.parse(data);
            this.setState({
                address: data.address,
            });
            if (data.message) {
                this.setState({
                    message: data.message,
                });
            }
        } else if (dataString.match(/iota\:/)) {
            // For codes with iota: at the front (TheTangle.org)
            data = data.substring(5);
            this.setState({
                address: data,
            });
        } else if (dataString.match(VALID_ADDRESS_WITH_CHECKSUM_REGEX)) {
            // For codes with plain text (Bitfinex, Binance, and IOTASear.ch)
            this.setState({
                address: data,
            });
        } else {
            generateAlert(
                'error',
                'Incorrect address format',
                'Valid addresses should be 90 characters and contain only A-Z or 9.',
            );
        }
        this._hideModal();
    }

    clearInteractions() {
        this.props.closeTopBar();
        Keyboard.dismiss();
    }

    getConversionTextFiat() {
        const convertedValue = round(this.state.amount / this.props.usdPrice / this.props.conversionRate, 10);
        let conversionText = '';
        if (0 < convertedValue && convertedValue < 0.01) {
            conversionText = '< 0.01 Mi';
        } else if (convertedValue >= 0.01) {
            conversionText = '= ' + convertedValue.toFixed(2) + ' Mi';
        }
        return conversionText;
    }
    getConversionTextIota() {
        const convertedValue = round(
            parseFloat(this.isValidAmount(this.state.amount) ? this.state.amount : 0) *
                this.props.usdPrice /
                1000000 *
                this.getUnitMultiplier() *
                this.props.conversionRate,
            10,
        );
        let conversionText = '';
        if (0 < convertedValue && convertedValue < 0.01) {
            conversionText = '< ' + currencySymbol + '0.01';
        } else if (convertedValue >= 0.01) {
            conversionText = '= ' + currencySymbol + convertedValue.toFixed(2);
        }
        return conversionText;
    }

    render() {
        const { amount, address, message, isModalVisible, denomination, maxColor, maxText, sending } = this.state;
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
        } = this.props;
        const textColor = { color: secondaryBackgroundColor };
        const sendBorderColor = { borderColor: ctaBorderColor };
        const infoImagePath = secondaryBackgroundColor === 'white' ? whiteInfoImagePath : blackInfoImagePath;
        const ctaTextColor = { color: secondaryCtaColor };

        return (
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => this.clearInteractions()}>
                <View style={styles.container}>
                    <View style={styles.emptyContainer} />
                    <View style={styles.topContainer}>
                        <View style={styles.fieldContainer}>
                            <CustomTextInput
                                onRef={c => {
                                    this.addressField = c;
                                }}
                                maxLength={90}
                                label={t('recipientAddress')}
                                onChangeText={address => this.setState({ address })}
                                containerStyle={{ width: width / 1.3 }}
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
                        </View>
                        <View style={styles.fieldContainer}>
                            <CustomTextInput
                                onRef={c => {
                                    this.amountField = c;
                                }}
                                keyboardType={'numeric'}
                                label={t('amount')}
                                onChangeText={amount => this.onAmountType(amount)}
                                containerStyle={{ width: width / 1.3 }}
                                autoCorrect={false}
                                enablesReturnKeyAutomatically
                                returnKeyType="next"
                                onSubmitEditing={() => this.messageField.focus()}
                                widget="denomination"
                                secondaryBackgroundColor={secondaryBackgroundColor}
                                negativeColor={negativeColor}
                                denominationText={denomination}
                                onDenominationPress={event => this.onDenominationPress()}
                                value={amount}
                                editable={!sending}
                                selectTextOnFocus={!sending}
                            />
                            <Text style={[styles.conversionText, textColor]}>
                                {' '}
                                {denomination === currencySymbol
                                    ? this.getConversionTextFiat()
                                    : this.getConversionTextIota()}{' '}
                            </Text>
                        </View>
                        <View style={styles.maxContainer}>
                            <TouchableOpacity onPress={event => this.onMaxPress()}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View
                                        style={[
                                            {
                                                width: width / 20,
                                                borderRadius: width / 40,
                                                height: width / 20,
                                                marginRight: width / 50,
                                                opacity: 0.8,
                                            },
                                            { backgroundColor: maxColor },
                                        ]}
                                    />
                                    <Text style={[styles.maxButtonText, { color: maxColor }]}>{maxText}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.messageFieldContainer}>
                            <CustomTextInput
                                onRef={c => {
                                    this.messageField = c;
                                }}
                                keyboardType={'default'}
                                label={t('message')}
                                onChangeText={message => this.setState({ message })}
                                containerStyle={{ width: width / 1.3 }}
                                autoCorrect={false}
                                enablesReturnKeyAutomatically
                                returnKeyType="send"
                                onSubmitEditing={() => this.setModalContent('transferConfirmation')}
                                secondaryBackgroundColor={secondaryBackgroundColor}
                                negativeColor={negativeColor}
                                value={message}
                                editable={!sending}
                                selectTextOnFocus={!sending}
                            />
                        </View>
                    </View>
                    <View style={styles.midContainer}>
                        {!isSendingTransfer &&
                            !isGettingSensitiveInfoToMakeTransaction && (
                                <View style={styles.sendButtonContainer}>
                                    <TouchableOpacity
                                        onPress={event => {
                                            this.setModalContent('transferConfirmation');
                                            this.addressField.blur();
                                            this.amountField.blur();
                                            this.messageField.blur();
                                        }}
                                    >
                                        <View
                                            style={[
                                                styles.sendButton,
                                                { backgroundColor: THEMES.getHSL(ctaColor) },
                                                sendBorderColor,
                                            ]}
                                        >
                                            <Text style={[styles.sendText, ctaTextColor]}>{t('send')}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )}
                        {(isGettingSensitiveInfoToMakeTransaction || isSendingTransfer) &&
                            !isModalVisible && (
                                <ActivityIndicator
                                    animating={
                                        (isGettingSensitiveInfoToMakeTransaction || isSendingTransfer) &&
                                        !isModalVisible
                                    }
                                    style={styles.activityIndicator}
                                    size="large"
                                    color={THEMES.getHSL(negativeColor)}
                                />
                            )}
                    </View>
                    <View style={styles.bottomContainer}>
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
                    <Modal
                        animationIn={'bounceInUp'}
                        animationOut={'bounceOut'}
                        animationInTiming={1000}
                        animationOutTiming={200}
                        backdropTransitionInTiming={500}
                        backdropTransitionOutTiming={200}
                        backdropColor={THEMES.getHSL(backgroundColor)}
                        style={{ alignItems: 'center', margin: 0 }}
                        isVisible={isModalVisible}
                        onBackButtonPress={() => this.setState({ isModalVisible: false })}
                    >
                        {this._renderModalContent()}
                    </Modal>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: height / 5,
    },
    emptyContainer: {
        flex: 0.5,
    },
    topContainer: {
        flex: 3.6,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    midContainer: {
        flex: 1.4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomContainer: {
        flex: 0.7,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    fieldContainer: {
        flex: 0.8,
        alignItems: 'center',
    },
    maxContainer: {
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: width / 1.3,
        flex: 0.3,
        paddingLeft: 1,
    },
    messageFieldContainer: {
        flex: 0.7,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButton: {
        borderRadius: GENERAL.borderRadius,
        width: width / 2,
        height: height / 13,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.2,
    },
    sendText: {
        fontFamily: 'Lato-Bold',
        fontSize: width / 25.9,
        backgroundColor: 'transparent',
    },
    sendIOTAImage: {
        height: width / 35,
        width: width / 35,
    },
    sendButtonContainer: {
        alignItems: 'center',
    },
    conversionText: {
        fontFamily: 'Lato-Light',
        backgroundColor: 'transparent',
        position: 'absolute',
        bottom: height / 27.5,
        right: width / 7.8,
    },
    maxButtonText: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 31.8,
        backgroundColor: 'transparent',
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

const mapStateToProps = state => ({
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
});

const mapDispatchToProps = {
    prepareTransfer,
    generateAlert,
    getFromKeychainRequest,
    getFromKeychainSuccess,
    getFromKeychainError,
};

export default translate(['send', 'global'])(connect(mapStateToProps, mapDispatchToProps)(Send));
