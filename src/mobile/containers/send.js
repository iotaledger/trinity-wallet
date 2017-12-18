import get from 'lodash/get';
import isFunction from 'lodash/isFunction';
import size from 'lodash/size';
import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { iota } from 'iota-wallet-shared-modules/libs/iota';
import {
    ActivityIndicator,
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
    LayoutAnimation,
    ListView,
    ScrollView,
    StatusBar,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { TextField } from 'react-native-material-textfield';
import { connect } from 'react-redux';
import { round, MAX_SEED_LENGTH, VALID_SEED_REGEX, ADDRESS_LENGTH } from 'iota-wallet-shared-modules/libs/util';
import { getCurrencySymbol } from 'iota-wallet-shared-modules/libs/currency';
import keychain, { getSeed } from '../util/keychain';
import { sendTransaction, sendTransferRequest } from 'iota-wallet-shared-modules/actions/tempAccount';
import DropdownAlert from 'react-native-dropdownalert';
import Modal from 'react-native-modal';
import QRScanner from '../components/qrScanner.js';
import TransferConfirmationModal from '../components/transferConfirmationModal';
import UnitInfoModal from '../components/unitInfoModal';
import { getAccountInfo } from 'iota-wallet-shared-modules/actions/account';

import infoImagePath from 'iota-wallet-shared-modules/images/info.png';
import DropdownHolder from '../components/dropdownHolder';
import { width, height } from '../util/dimensions';
const StatusBarDefaultBarStyle = 'light-content';

let sentDenomination = '';
let currencySymbol = '';

class Send extends Component {
    constructor() {
        super();
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
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
        currencySymbol = getCurrencySymbol(this.props.settings.currency);
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
        let max = (this.props.account.balance / this.getUnitMultiplier()).toString();
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

    isValidMessage(message) {
        //return this.state.message.match(VALID_SEED_REGEX);
        return true;
    }

    isValidAmount(amount) {
        var value = parseFloat(amount);
        return !isNaN(value);
    }

    enoughBalance() {
        if (parseFloat(this.state.amount) * this.getUnitMultiplier() > this.props.account.balance) {
            return false;
        } else {
            return true;
        }
    }

    renderInvalidAddressErrors(address) {
        const { t } = this.props;
        const props = ['error', t('invalidAddress')];
        const dropdown = DropdownHolder.getDropdown();

        if (size(address) !== 90) {
            return dropdown.alertWithType(...props, t('invalidAddressExplanation1', { maxLength: ADDRESS_LENGTH }));
        } else if (address.match(VALID_SEED_REGEX) == null) {
            return dropdown.alertWithType(...props, t('invalidAddressExplanation2'));
        }

        return dropdown.alertWithType(...props, t('invalidAddressExplanation3'));
    }

    onSendPress() {
        const { t } = this.props;
        const address = this.state.address;
        const amount = this.state.amount;
        const value = parseFloat(this.state.amount) * this.getUnitMultiplier();
        const message = this.state.message;

        const addressIsValid = this.isValidAddress(address);
        const messageIsValid = this.isValidMessage(message);
        const enoughBalance = this.enoughBalance();
        const amountIsValid = this.isValidAmount(amount);
        const addressCharsAreValid = this.isValidAddressChars(address);

        if (addressIsValid && messageIsValid && enoughBalance && amountIsValid && addressCharsAreValid) {
            this._showModal();
        }

        if (!enoughBalance) {
            const dropdown = DropdownHolder.getDropdown();
            return dropdown.alertWithType('error', t('notEnoughFunds'), t('notEnoughFundsExplanation'));
        }
        if (!addressIsValid) {
            this.renderInvalidAddressErrors(address);
        }

        if (!amountIsValid) {
            const dropdown = DropdownHolder.getDropdown();
            return dropdown.alertWithType('error', t('invalidAmount'), t('invalidAmountExplanation'));
        }

        if (!messageIsValid) {
            console.log('invalid message');
        }
    }

    sendTransfer() {
        const { t } = this.props;
        const dropdown = DropdownHolder.getDropdown();
        if (this.props.tempAccount.isSyncing) {
            dropdown.alertWithType('error', t('global:syncInProgress'), t('global:syncInProgressExplanation'));
            return;
        }
        sentDenomination = this.state.denomination;

        const accountInfo = this.props.account.accountInfo;
        const seedIndex = this.props.tempAccount.seedIndex;
        const seedName = this.props.account.seedNames[seedIndex];
        const currentSeedAccountInfo = accountInfo[Object.keys(accountInfo)[seedIndex]];

        const address = this.state.address;
        const value = parseFloat(this.state.amount) * this.getUnitMultiplier();
        const message = this.state.message;

        this.props.sendTransferRequest();
        keychain
            .get()
            .then(credentials => {
                if (get(credentials, 'data')) {
                    const seed = getSeed(credentials.data, this.props.tempAccount.seedIndex);
                    sendTx(seed);
                }
            })
            .catch(err => console.log(err));

        const sendTx = seed =>
            this.props.sendTransaction(seed, currentSeedAccountInfo, seedName, address, value, message);
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
                multiplier = 1000000 * this.props.settings.conversionRate;
                break;
        }
        return multiplier;
    }

    _showModal = () => this.setState({ isModalVisible: true });

    _hideModal = callback =>
        this.setState({ isModalVisible: false }, () => {
            const callable = fn => isFunction(fn);

            if (callable(callback)) {
                setTimeout(() => {
                    callback();
                });
            }
        });

    _renderModalContent = () => <View style={styles.modalContent}>{this.state.modalContent}</View>;

    setModalContent(selectedSetting) {
        let modalContent;
        switch (selectedSetting) {
            case 'qrScanner':
                modalContent = <QRScanner onQRRead={data => this.onQRRead(data)} hideModal={() => this._hideModal()} />;
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
                    />
                );
                this.setState({
                    selectedSetting,
                    modalContent,
                });
                this.onSendPress();
                break;
            case 'unitInfo':
                modalContent = <UnitInfoModal hideModal={() => this._hideModal()} />;
                this.setState({
                    selectedSetting,
                    modalContent,
                });
                this._showModal();
                break;
        }
    }

    onQRRead(data) {
        this.setState({
            address: data.substring(0, 90),
            message: data.substring(91),
        });
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
        const convertedValue = round(
            this.state.amount / this.props.marketData.usdPrice / this.props.settings.conversionRate,
            2,
        );
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
                this.props.marketData.usdPrice /
                1000000 *
                this.getUnitMultiplier() *
                this.props.settings.conversionRate,
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
        let { amount, address, message, denomination } = this.state;
        const { t } = this.props;
        const maxHeight = this.state.maxPressed ? height / 10 : 0;
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
                                    style={styles.textField}
                                    labelTextStyle={{ fontFamily: 'Lato-Light' }}
                                    labelFontSize={height / 55}
                                    maxLength={90}
                                    fontSize={height / 40}
                                    height={height / 24}
                                    labelPadding={2}
                                    baseColor="white"
                                    tintColor="#F7D002"
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
                                    <View style={styles.button}>
                                        <Text style={styles.qrText}>{t('global:qr')}</Text>
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
                                    baseColor="white"
                                    enablesReturnKeyAutomatically={true}
                                    returnKeyType="next"
                                    label={t('amount')}
                                    tintColor="#F7D002"
                                    autoCorrect={false}
                                    value={amount}
                                    onChangeText={amount => this.onAmountType(amount)}
                                    onSubmitEditing={() => this.refs.message.focus()}
                                />
                            </View>
                            {denomination != this.props.settings.currencySymbol && (
                                <Text style={styles.conversionText}>
                                    {' '}
                                    {this.state.denomination == currencySymbol
                                        ? this.getConversionTextFiat()
                                        : this.getConversionTextIota()}{' '}
                                </Text>
                            )}
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity onPress={ebent => this.onDenominationPress()}>
                                    <View style={styles.button}>
                                        <Text style={styles.buttonText}> {this.state.denomination} </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.maxContainer}>
                            <View style={styles.maxButtonContainer}>
                                <TouchableOpacity onPress={event => this.onMaxPress()}>
                                    <View style={styles.maxButton}>
                                        <Text style={styles.maxButtonText}>{t('max')}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            {this._renderMaximum()}
                        </View>
                        <View style={styles.messageFieldContainer}>
                            <TextField
                                ref={'message'}
                                style={styles.textField}
                                labelTextStyle={{ fontFamily: 'Lato-Light' }}
                                labelFontSize={height / 55}
                                fontSize={height / 40}
                                height={height / 24}
                                labelPadding={2}
                                baseColor="white"
                                enablesReturnKeyAutomatically={true}
                                returnKeyType="send"
                                label={t('message')}
                                tintColor="#F7D002"
                                autoCorrect={false}
                                value={message}
                                onChangeText={message => this.setState({ message })}
                                onSubmitEditing={() => this.onSendPress()}
                            />
                        </View>
                    </View>
                    <View style={styles.midContainer}>
                        {!this.props.tempAccount.isSendingTransfer && (
                            <View style={styles.sendIOTAButtonContainer}>
                                <TouchableOpacity
                                    onPress={event => {
                                        this.setModalContent('transferConfirmation');
                                        this.refs.address.blur();
                                        this.refs.amount.blur();
                                        this.refs.message.blur();
                                    }}
                                >
                                    <View style={styles.sendIOTAButton}>
                                        <Text style={styles.sendIOTAText}>{t('send')}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )}
                        {this.props.tempAccount.isSendingTransfer &&
                            !this.state.isModalVisible && (
                                <ActivityIndicator
                                    animating={this.props.tempAccount.isSendingTransfer && !this.state.isModalVisible}
                                    style={styles.activityIndicator}
                                    size="large"
                                    color="#F7D002"
                                />
                            )}
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity
                            style={styles.infoButton}
                            onPress={() => this.setModalContent('unitInfo')}
                            hitSlop={{ top: width / 30, bottom: width / 30, left: width / 30, right: width / 30 }}
                        >
                            <View style={styles.info}>
                                <Image source={infoImagePath} style={styles.infoIcon} />
                                <Text style={styles.infoText}>{t('iotaUnits')}</Text>
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
                        backdropColor={'#102832'}
                        style={{ alignItems: 'center', margin: 0 }}
                        isVisible={this.state.isModalVisible}
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
        color: 'white',
        fontFamily: 'Lato-Light',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: 'white',
        borderWidth: 0.8,
        borderRadius: 8,
        width: width / 6.5,
        height: height / 16,
    },
    qrText: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 29.6,
        backgroundColor: 'transparent',
    },
    buttonText: {
        color: 'white',
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
        borderColor: 'rgba(255, 255, 255, 0.6)',
        borderWidth: 1.5,
        borderRadius: 15,
        width: width / 2,
        height: height / 13,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#009f3f',
    },
    sendIOTAText: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 25.9,
        backgroundColor: 'transparent',
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
        color: 'white',
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
        color: 'white',
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
        borderColor: 'white',
        borderWidth: 0.8,
        borderRadius: 8,
        width: width / 6,
        height: height / 16,
    },
    infoText: {
        color: 'white',
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
    marketData: state.marketData,
    tempAccount: state.tempAccount,
    account: state.account,
    settings: state.settings,
});

const mapDispatchToProps = dispatch => ({
    sendTransaction: (seed, currentSeedAccountInfo, seedName, address, value, message) => {
        dispatch(sendTransaction(seed, currentSeedAccountInfo, seedName, address, value, message));
    },
    getAccountInfo: (seedName, seedIndex, accountInfo) => {
        dispatch(getAccountInfo(seedName, seedIndex, accountInfo));
    },
    sendTransferRequest: () => dispatch(sendTransferRequest()),
});

export default translate(['send', 'global'])(connect(mapStateToProps, mapDispatchToProps)(Send));
