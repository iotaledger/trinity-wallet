import isUndefined from 'lodash/isUndefined';
import size from 'lodash/size';
import React, { Component } from 'react';
import { iota } from '../../shared/libs/iota';
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
    Dimensions,
    StatusBar,
} from 'react-native';
import { TextField } from 'react-native-material-textfield';
import { connect } from 'react-redux';
import { round } from '../../shared/libs/util';
import { getFromKeychain, getSeed } from '../../shared/libs/cryptography';
import { sendTransaction, sendTransferRequest } from '../../shared/actions/tempAccount';
import DropdownAlert from 'react-native-dropdownalert';
import Modal from 'react-native-modal';
import QRScanner from '../components/qrScanner.js';
import TransferConfirmationModal from '../components/transferConfirmationModal';
import { getAccountInfo } from '../../shared/actions/account';

import DropdownHolder from '../components/dropdownHolder';
const width = Dimensions.get('window').width
const height = global.height;
const StatusBarDefaultBarStyle = 'light-content';

let sentDenomination = '';

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

    onDenominationPress() {
        switch (this.state.denomination) {
            case 'Mi':
                this.setState({ denomination: 'Gi' });
                break;
            case 'Gi':
                this.setState({ denomination: 'Ti' });
                break;
            case 'Ti':
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
        this.setState({
            amount: (this.props.account.balance / 1000000).toString(),
            denomination: 'Mi',
        });
    }

    hasInvalidCharacters(value) {
        // Currently just checks for white spaces
        const testAgainst = /\s/;
        return testAgainst.test(value);
    }

    isValidAddress(address) {
        return size(address) === 90 && iota.utils.isValidChecksum(address) && !this.hasInvalidCharacters(address);
    }

    isValidMessage(message) {
        //return this.state.message.match(/^[A-Z9]+$/);
        return true;
    }

    enoughBalance() {
        if (parseFloat(this.state.amount) * this.getUnitMultiplier() > this.props.account.balance) {
            return false;
        } else {
            return true;
        }
    }

    renderInvalidAddressErrors(address) {
        const props = ['error', 'Invalid Address'];
        const dropdown = DropdownHolder.getDropdown();

        if (size(address) !== 90) {
            return dropdown.alertWithType(...props, 'Address should be 81 characters long and should have a checksum.');
        } else if (this.hasInvalidCharacters(address)) {
            return dropdown.alertWithType(...props, 'Address contains invalid characters.');
        }

        return dropdown.alertWithType(...props, 'Address contains invalid checksum');
    }

    onSendPress() {
        const address = this.state.address;
        const value = parseFloat(this.state.amount) * this.getUnitMultiplier();
        const message = this.state.message;

        const dropdown = DropdownHolder.getDropdown();
        const addressIsValid = this.isValidAddress(address);
        const messageIsValid = this.isValidMessage(message);
        const enoughBalance = this.enoughBalance();

        if (addressIsValid && messageIsValid && enoughBalance) {
            this._showModal();
        }

        if (!enoughBalance) {
            const dropdown = DropdownHolder.getDropdown();
            return dropdown.alertWithType(
                'error',
                'Not enough cash',
                'You do not have enough IOTA to complete this transfer.',
            );
        }
        if (!addressIsValid) {
            this.renderInvalidAddressErrors(address);
        }

        if (!messageIsValid) {
            console.log('invalid message');
        }
    }

    sendTransfer() {
        sentDenomination = this.state.denomination;

        const accountInfo = this.props.account.accountInfo;
        const seedIndex = this.props.tempAccount.seedIndex;
        const seedName = this.props.account.seedNames[seedIndex];
        const currentSeedAccountInfo = accountInfo[Object.keys(accountInfo)[seedIndex]];

        const address = this.state.address;
        const value = parseFloat(this.state.amount) * this.getUnitMultiplier();
        const message = this.state.message;

        this.props.sendTransferRequest();
        getFromKeychain(this.props.tempAccount.password, value => {
            if (typeof value !== 'undefined') {
                var seed = getSeed(value, this.props.tempAccount.seedIndex);
                if (sendTx(seed) == false) {
                    this.dropdown.alertWithType(
                        'error',
                        'Key reuse',
                        `The address you are trying to send to has already been used. Please try another address.`,
                    );
                }
            } else {
                console.log('error');
            }
        });

        const _this = this;
        function sendTx(seed) {
            _this.props.sendTransaction(seed, currentSeedAccountInfo, seedName, address, value, message);
        }
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
        }
        return multiplier;
    }

    _showModal = () => this.setState({ isModalVisible: true });

    _hideModal = () => this.setState({ isModalVisible: false });

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
                        denomination={this.state.denomination}
                        address={this.state.address}
                        sendTransfer={() => this.sendTransfer()}
                        hideModal={() => this._hideModal()}
                    />
                );
                this.setState({
                    selectedSetting,
                    modalContent,
                });
                this.onSendPress();
                break;
        }
    }

    onQRRead(data) {
        this.setState({
            address: data,
        });
        this._hideModal();
    }

    render() {
        let { amount, address, message } = this.state;
        const conversion = round(
            parseInt(this.state.amount == '' ? 0 : this.state.amount) *
                this.props.marketData.usdPrice /
                1000000 *
                this.getUnitMultiplier(),
            10,
        )
        return (
            <ScrollView scrollEnabled={false} style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={styles.topContainer}>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={styles.textFieldContainer}>
                            <TextField
                                autoCapitalize="characters"
                                style={styles.textField}
                                labelTextStyle={{ fontFamily: 'Lato-Light' }}
                                labelFontSize={height / 55}
                                fontSize={height / 40}
                                height={height / 24}
                                labelPadding={2}
                                baseColor="white"
                                tintColor="#F7D002"
                                enablesReturnKeyAutomatically={true}
                                label="Recipient address"
                                autoCorrect={false}
                                value={address}
                                onChangeText={address => this.setState({ address })}
                            />
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => this.setModalContent('qrScanner')}>
                                <View style={styles.button}>
                                    <Text style={styles.qrText}> QR </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={styles.textFieldContainer}>
                            <TextField
                                keyboardType={'numeric'}
                                style={styles.textField}
                                labelTextStyle={{ fontFamily: 'Lato-Light' }}
                                labelFontSize={height / 55}
                                fontSize={height / 40}
                                height={height / 24}
                                labelPadding={2}
                                baseColor="white"
                                enablesReturnKeyAutomatically={true}
                                label="Amount"
                                tintColor="#F7D002"
                                autoCorrect={false}
                                value={amount}
                                onChangeText={amount => this.setState({ amount })}
                            />
                        </View>
                        <Text style={styles.conversionText}>
                            {' '}
                            {' '}
                            { conversion == 0 ? '' : (conversion < 0.01 ? '< $0.01' : '= $' + conversion.toFixed(2))}{' '}
                        </Text>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={ebent => this.onDenominationPress()}>
                                <View style={styles.button}>
                                    <Text style={styles.buttonText}> {this.state.denomination} </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.maxButtonContainer}>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={event => this.onMaxPress()}>
                                <View style={styles.maxButton}>
                                    <Text style={styles.maxButtonText}> MAX </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.textFieldContainer}>
                        <TextField
                            style={styles.textField}
                            labelTextStyle={{ fontFamily: 'Lato-Light' }}
                            labelFontSize={height / 55}
                            fontSize={height / 40}
                            height={height / 24}
                            labelPadding={2}
                            baseColor="white"
                            enablesReturnKeyAutomatically={true}
                            label="Message"
                            tintColor="#F7D002"
                            autoCorrect={false}
                            value={message}
                            onChangeText={message => this.setState({ message })}
                        />
                    </View>
                    {!this.props.tempAccount.isSendingTransfer && (
                        <View style={styles.sendIOTAButtonContainer}>
                            <TouchableOpacity onPress={event => this.setModalContent('transferConfirmation')}>
                                <View style={styles.sendIOTAButton}>
                                    <Text style={styles.sendIOTAText}>SEND</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}
                    <View style={{ flex: 1 }}>
                        <ActivityIndicator
                            animating={this.props.tempAccount.isSendingTransfer}
                            style={styles.activityIndicator}
                            size="large"
                            color="#F7D002"
                        />
                    </View>
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
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: height / 25,
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: height / 5,
    },
    topContainer: {
        paddingHorizontal: width / 10,
        zIndex: 1,
        flex: 1,
    },
    textFieldContainer: {
        flex: 1,
        paddingRight: width / 20,
        paddingTop: 1,
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
        paddingBottom: height / 90,
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
        paddingTop: height / 16,
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
    maxButtonContainer: {
        justifyContent: 'flex-start',
        marginTop: height / 150,
        flexDirection: 'row'
    },
    maxButtonText: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 29.6,
        backgroundColor: 'transparent',
    },
    maxWarningText: {

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
});

const mapStateToProps = state => ({
    marketData: state.marketData,
    tempAccount: state.tempAccount,
    account: state.account,
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

export default connect(mapStateToProps, mapDispatchToProps)(Send);
