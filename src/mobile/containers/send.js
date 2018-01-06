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
    StatusBar,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { TextField } from 'react-native-material-textfield';
import { connect } from 'react-redux';
import { round, VALID_SEED_REGEX, ADDRESS_LENGTH, parse } from 'iota-wallet-shared-modules/libs/util';
import { getCurrencySymbol } from 'iota-wallet-shared-modules/libs/currency';
import keychain, { getSeed } from '../util/keychain';
import {
    getFromKeychainRequest,
    getFromKeychainSuccess,
    getFromKeychainError,
} from 'iota-wallet-shared-modules/actions/keychain';
import { sendTransaction } from 'iota-wallet-shared-modules/actions/tempAccount';
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

import infoImagePath from 'iota-wallet-shared-modules/images/info.png';
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
        sendTransaction: PropTypes.func.isRequired,
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
    };

    constructor() {
        super();

        this.state = {
            denomination: 'i',
            amount: '',
            address: '',
            message: '',
            dataSource: ds.cloneWithRows([]),
            selectedSetting: '',
            modalContent: '',
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
        }
    }

    onDenominationPress() {
        switch (this.state.denomination) {
            case 'Mi':
                this.setState({ denomination: 'Gi' });
                break;
            case 'Gi':
                this.setState({ denomination: 'Ti' });
                break;
            case 'Ti':
                this.setState({ denomination: currencySymbol });
                break;
            case currencySymbol:
                this.setState({ denomination: 'i' });
                break;
            case 'i':
                this.setState({ denomination: 'Ki' });
                break;
            case 'Ki':
                this.setState({ denomination: 'Mi' });
                break;
        }
    }

    onMaxPress() {
        const max = (this.props.balance / this.getUnitMultiplier()).toString();

        this.setState({
            amount: max,
            maxPressed: true,
        });
    }

    onAmountType(amount) {
        this.setState({ amount, maxPressed: false });
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
        const { t } = this.props;
        const props = ['error', t('invalidAddress')];

        if (size(address) !== 90) {
            return this.props.generateAlert(...props, t('invalidAddressExplanation1', { maxLength: ADDRESS_LENGTH }));
        } else if (address.match(VALID_SEED_REGEX) === null) {
            return this.props.generateAlert(...props, t('invalidAddressExplanation2'));
        }

        return this.props.generateAlert(...props, t('invalidAddressExplanation3'));
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
        const value = parseFloat(this.state.amount) * this.getUnitMultiplier();
        const message = this.state.message;

        this.props.getFromKeychainRequest('send', 'makeTransaction');
        keychain
            .get()
            .then(credentials => {
                this.props.getFromKeychainSuccess('send', 'makeTransaction');

                if (get(credentials, 'data')) {
                    const seed = getSeed(credentials.data, seedIndex);
                    this.props.sendTransaction(seed, address, value, message, selectedAccountName);
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
                multiplier = 1000000 * this.props.conversionRate;
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
        switch (selectedSetting) {
            case 'qrScanner':
                modalContent = (
                    <QRScanner
                        onQRRead={data => this.onQRRead(data)}
                        hideModal={() => this._hideModal()}
                        backgroundColor={THEMES.getHSL(this.props.backgroundColor)}
                        ctaColor={THEMES.getHSL(this.props.ctaColor)}
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
                        clearOnSend={() => this.setState({ message: '', amount: '', address: '' })}
                        denomination={this.state.denomination}
                        address={this.state.address}
                        sendTransfer={() => this.sendTransfer()}
                        hideModal={callback => this._hideModal(callback)}
                        backgroundColor={THEMES.getHSL(this.props.barColor)}
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
        if (data.match(/{/)) {
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
        } else {
            // For codes with plain text (Bitfinex and Binance)
            this.setState({
                address: data,
            });
        }

        this._hideModal();
    }

    _renderMaximum() {
        const { t } = this.props;

        if (this.state.maxPressed) {
            return (
                <View style={{ justifyContent: 'center' }}>
                    <Text style={styles.maxWarningText}>{t('maximumSelected')}</Text>
                </View>
            );
        } else {
            return null;
        }
    }

    clearInteractions() {
        this.props.closeTopBar();
        Keyboard.dismiss();
    }

    getConversionTextFiat() {
        const convertedValue = round(this.state.amount / this.props.usdPrice / this.props.conversionRate, 2);
        let conversionText = '';
        if (0 < convertedValue && convertedValue < 0.01) {
            conversionText = '< 0.01 Mi';
        } else if (convertedValue >= 0.01) {
            conversionText = '= ' + convertedValue + ' Mi';
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
        const { amount, address, message } = this.state;
        const { t, ctaColor, backgroundColor, negativeColor, secondaryBackgroundColor } = this.props;
        const textColor = { color: secondaryBackgroundColor };
        const borderColor = { borderColor: secondaryBackgroundColor };

        return (
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => this.clearInteractions()}>
                <View style={styles.container}>
                    <StatusBar barStyle="light-content" />
                    <View style={styles.emptyContainer} />
                    <View style={styles.topContainer}>
                        <View style={styles.fieldContainer}>
                            <View style={styles.textFieldContainer}>
                                <TextField
                                    ref="address"
                                    autoCapitalize={'characters'}
                                    style={[styles.textField, textColor]}
                                    labelTextStyle={{ fontFamily: 'Lato-Light' }}
                                    labelFontSize={height / 55}
                                    maxLength={90}
                                    fontSize={height / 40}
                                    height={height / 24}
                                    labelPadding={2}
                                    baseColor={secondaryBackgroundColor}
                                    tintColor={THEMES.getHSL(negativeColor)}
                                    enablesReturnKeyAutomatically={true}
                                    returnKeyType="next"
                                    label={t('recipientAddress')}
                                    autoCorrect={false}
                                    value={address}
                                    onChangeText={address => this.setState({ address })}
                                    onSubmitEditing={() => this.refs.amount.focus()}
                                />
                            </View>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity onPress={() => this.setModalContent('qrScanner')}>
                                    <View style={[styles.button, borderColor]}>
                                        <Text style={[styles.qrText, textColor]}>{t('global:qr')}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.fieldContainer}>
                            <View style={styles.textFieldContainer}>
                                <TextField
                                    ref={'amount'}
                                    keyboardType={'numeric'}
                                    style={styles.textField}
                                    labelTextStyle={{ fontFamily: 'Lato-Light' }}
                                    labelFontSize={height / 55}
                                    fontSize={height / 40}
                                    height={height / 24}
                                    labelPadding={2}
                                    baseColor={secondaryBackgroundColor}
                                    enablesReturnKeyAutomatically={true}
                                    returnKeyType="next"
                                    label={t('amount')}
                                    tintColor={THEMES.getHSL(negativeColor)}
                                    autoCorrect={false}
                                    value={amount}
                                    onChangeText={amount => this.onAmountType(amount)}
                                    onSubmitEditing={() => this.refs.message.focus()}
                                />
                            </View>
                            <Text style={[styles.conversionText, textColor]}>
                                {' '}
                                {this.state.denomination === currencySymbol
                                    ? this.getConversionTextFiat()
                                    : this.getConversionTextIota()}{' '}
                            </Text>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity onPress={event => this.onDenominationPress()}>
                                    <View style={[styles.button, borderColor]}>
                                        <Text style={[styles.buttonText, textColor]}> {this.state.denomination} </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.maxContainer}>
                            <View style={styles.maxButtonContainer}>
                                <TouchableOpacity onPress={event => this.onMaxPress()}>
                                    <View style={[styles.maxButton, borderColor]}>
                                        <Text style={[styles.maxButtonText, textColor]}>{t('max')}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            {this._renderMaximum()}
                        </View>
                        <View style={styles.messageFieldContainer}>
                            <TextField
                                ref={'message'}
                                style={[styles.textField, textColor]}
                                labelTextStyle={{ fontFamily: 'Lato-Light' }}
                                labelFontSize={height / 55}
                                fontSize={height / 40}
                                height={height / 24}
                                labelPadding={2}
                                baseColor={secondaryBackgroundColor}
                                enablesReturnKeyAutomatically={true}
                                returnKeyType="send"
                                label={t('message')}
                                tintColor={THEMES.getHSL(negativeColor)}
                                autoCorrect={false}
                                value={message}
                                onChangeText={message => this.setState({ message })}
                                onSubmitEditing={() => this.onSendPress()}
                            />
                        </View>
                    </View>
                    <View style={styles.midContainer}>
                        {!this.props.isSendingTransfer &&
                            !this.props.isGettingSensitiveInfoToMakeTransaction && (
                                <View style={styles.sendIOTAButtonContainer}>
                                    <TouchableOpacity
                                        onPress={event => {
                                            this.setModalContent('transferConfirmation');
                                            this.refs.address.blur();
                                            this.refs.amount.blur();
                                            this.refs.message.blur();
                                        }}
                                    >
                                        <View
                                            style={[
                                                styles.sendIOTAButton,
                                                { backgroundColor: THEMES.getHSL(ctaColor) },
                                            ]}
                                        >
                                            <Text style={styles.sendIOTAText}>{t('send')}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )}
                        {(this.props.isGettingSensitiveInfoToMakeTransaction || this.props.isSendingTransfer) &&
                            !this.state.isModalVisible && (
                                <ActivityIndicator
                                    animating={
                                        (this.props.isGettingSensitiveInfoToMakeTransaction ||
                                            this.props.isSendingTransfer) &&
                                        !this.state.isModalVisible
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
                        isVisible={this.state.isModalVisible}
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
        flex: 0.3,
    },
    topContainer: {
        paddingHorizontal: width / 10,
        flex: 2.5,
        justifyContent: 'flex-end',
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
        flexDirection: 'row',
        flex: 1,
        alignItems: 'flex-end',
    },
    textFieldContainer: {
        flex: 1,
        paddingRight: width / 30,
        paddingTop: 1,
    },
    messageFieldContainer: {
        flex: 0.7,
        justifyContent: 'center',
    },
    maxButtonContainer: {
        flex: 0.5,
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
    },
    textField: {
        fontFamily: 'Lato-Light',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.8,
        borderRadius: GENERAL.borderRadius,
        width: width / 6.5,
        height: height / 16,
    },
    qrText: {
        fontFamily: 'Lato-Bold',
        fontSize: width / 29.6,
        backgroundColor: 'transparent',
    },
    buttonText: {
        fontFamily: 'Lato-Bold',
        fontSize: width / 29.6,
        backgroundColor: 'transparent',
    },
    buttonContainer: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: height / 110,
    },
    sendIOTAButton: {
        borderRadius: GENERAL.borderRadiusLarge,
        width: width / 2,
        height: height / 13,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendIOTAText: {
        fontFamily: 'Lato-Bold',
        fontSize: width / 25.9,
        backgroundColor: 'transparent',
        color: 'white',
    },
    sendIOTAImage: {
        height: width / 35,
        width: width / 35,
    },
    sendIOTAButtonContainer: {
        alignItems: 'center',
    },
    separator: {
        flex: 1,
        height: 15,
    },
    conversionText: {
        fontFamily: 'Lato-Light',
        backgroundColor: 'transparent',
        position: 'absolute',
        bottom: height / 45,
        right: width / 4.6,
    },
    maxContainer: {
        justifyContent: 'flex-start',
        marginTop: height / 150,
        flexDirection: 'row',
        alignItems: 'center',
    },
    maxButtonText: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 29.6,
        backgroundColor: 'transparent',
    },
    maxWarningText: {
        color: '#FF6C69',
        fontFamily: 'Lato-Regular',
        fontSize: width / 29.6,
        backgroundColor: 'transparent',
        marginLeft: width / 30,
        justifyContent: 'center',
    },
    maxButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.8,
        borderRadius: GENERAL.borderRadius,
        width: width / 6,
        height: height / 16,
    },
    infoText: {
        fontFamily: 'Lato-Light',
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
});

const mapDispatchToProps = {
    sendTransaction,
    generateAlert,
    getFromKeychainRequest,
    getFromKeychainSuccess,
    getFromKeychainError,
};

export default translate(['send', 'global'])(connect(mapStateToProps, mapDispatchToProps)(Send));
