import isUndefined from 'lodash/isUndefined';
import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import {
    ActivityIndicator,
    StyleSheet,
    View,
    Text,
    Image,
    ListView,
    Dimensions,
    TouchableOpacity,
    Clipboard,
    StatusBar,
    ScrollView,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { connect } from 'react-redux';
import {
    generateNewAddress,
    setReceiveAddress,
    generateNewAddressRequest,
    generateNewAddressError,
} from 'iota-wallet-shared-modules/actions/tempAccount';
import { TextField } from 'react-native-material-textfield';
import { getFromKeychain, getSeed } from 'iota-wallet-shared-modules/libs/cryptography';
import TransactionRow from '../components/transactionRow';
import DropdownHolder from '../components/dropdownHolder';

import { width, height } from '../util/dimensions';
const StatusBarDefaultBarStyle = 'light-content';
const isAndroid = Platform.OS === 'android';

class Receive extends Component {
    constructor() {
        super();
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.state = {
            dataSource: ds.cloneWithRows([]),
            message: '',
        };
        this.onGeneratePress = this.onGeneratePress.bind(this);
    }

    componentWillUnmount() {
        this.resetAddress();
    }

    resetAddress() {
        const { tempAccount: { receiveAddress } } = this.props;
        if (receiveAddress) {
            this.props.setReceiveAddress(' ');
        }
    }

    onGeneratePress() {
        const dropdown = DropdownHolder.getDropdown();
        if (this.props.tempAccount.isSyncing) {
            dropdown.alertWithType('error', 'Syncing in process', 'Please wait until syncing is complete.');
            return;
        }

        this.props.generateNewAddressRequest();
        const seedIndex = this.props.tempAccount.seedIndex;
        const accountName = this.props.account.seedNames[seedIndex];
        const accountInfo = this.props.account.accountInfo;
        const currentSeedAccountInfo = accountInfo[Object.keys(accountInfo)[seedIndex]];
        const addresses = currentSeedAccountInfo.addresses;
        getFromKeychain(this.props.tempAccount.password, value => {
            if (typeof value != 'undefined' && value != null) {
                const seed = getSeed(value, seedIndex);
                generate(seed, accountName, addresses);
            } else {
                error();
            }
        });

        const generate = (seed, accountName, addresses) => this.props.generateNewAddress(seed, accountName, addresses);
        const error = () => {
            this.props.generateNewAddressError();
            dropdown.alertWithType('error', t('somethingWentWrong'), t('somethingWentWrongExplanation'));
        };
    }

    onAddressPress(address) {
        const dropdown = DropdownHolder.getDropdown();
        if (address !== ' ') {
            Clipboard.setString(address);
            dropdown.alertWithType('success', t('addressCopied'), t('addressCopiedExplanation'));
        }
    }

    getOpacity() {
        const { tempAccount: { receiveAddress } } = this.props;
        if (receiveAddress == ' ') {
            return 0.1;
        } else {
            return 1;
        }
    }

    getQrOpacity() {
        const { tempAccount: { receiveAddress } } = this.props;
        if (receiveAddress == ' ' && isAndroid) {
            return 0.1;
        } else {
            return 1;
        }
    }

    clearInteractions() {
        this.props.closeTopBar();
        Keyboard.dismiss();
    }

    render() {
        const { tempAccount: { receiveAddress, isGeneratingReceiveAddress } } = this.props;
        const message = this.state.message;
        return (
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => this.clearInteractions()}>
                <View style={styles.container}>
                    <View
                        style={{
                            opacity: this.getOpacity(),
                            alignItems: 'center',
                            flex: 2,
                            justifyContent: 'flex-end',
                        }}
                    >
                        <View style={[styles.qrContainer, { opacity: this.getQrOpacity() }]}>
                            <QRCode
                                value={receiveAddress + ':' + message}
                                size={height / 5}
                                bgColor="#000"
                                fgColor="#FFF"
                            />
                        </View>
                        <TouchableOpacity onPress={() => this.onAddressPress(receiveAddress)}>
                            <View style={styles.receiveAddressContainer}>
                                <Text numberOfLines={5} style={styles.receiveAddressText}>
                                    {receiveAddress}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ alignItems: 'center', flex: 0.5, justifyContent: 'flex-start' }}>
                        <TextField
                            style={styles.textField}
                            labelTextStyle={{ fontFamily: 'Lato-Light', color: 'white' }}
                            labelFontSize={height / 55}
                            fontSize={height / 40}
                            labelPadding={3}
                            baseColor="white"
                            tintColor="#F7D002"
                            enablesReturnKeyAutomatically={true}
                            label={t('message')}
                            autoCorrect={false}
                            value={message}
                            containerStyle={{ width: width / 1.36 }}
                            onChangeText={message => this.setState({ message })}
                            ref="message"
                        />
                    </View>
                    <View style={{ flex: 0.5, justifyContent: 'center' }}>
                        {receiveAddress === ' ' &&
                            !isGeneratingReceiveAddress && (
                                <TouchableOpacity
                                    onPress={() => {
                                        // Check if there's already a network call in progress.
                                        if (!isGeneratingReceiveAddress) {
                                            this.onGeneratePress();
                                        }
                                    }}
                                >
                                    <View style={styles.generateButton}>
                                        <Text style={styles.generateText}>{t('generateNewAddress')}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        {isGeneratingReceiveAddress && (
                            <View style={{ height: height / 10 }}>
                                <ActivityIndicator
                                    animating={isGeneratingReceiveAddress}
                                    style={styles.activityIndicator}
                                    size="large"
                                    color="#F7D002"
                                />
                            </View>
                        )}
                        {receiveAddress.length > 1 &&
                            message.length > 1 && (
                                <TouchableOpacity
                                    onPress={() => {
                                        // Check if there's already a network call in progress.
                                        this.setState({ message: '' });
                                        this.refs.message.blur();
                                    }}
                                    style={styles.removeButtonContainer}
                                >
                                    <View style={styles.removeButton}>
                                        <Text style={styles.removeText}>{t('removeMessage')}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                    </View>
                    <View style={{ flex: 0.2 }} />
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    receiveAddressContainer: {
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 8,
        width: width / 2.05,
        height: width / 3.4,
        justifyContent: 'center',
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: height / 5,
    },
    receiveAddressText: {
        fontFamily: 'Inconsolata-Bold',
        fontSize: width / 21.8,
        color: 'white',
        backgroundColor: 'transparent',
        padding: width / 30,
        textAlign: 'center',
    },
    generateButton: {
        borderColor: 'rgba(255, 255, 255, 0.6)',
        borderWidth: 1.5,
        borderRadius: 15,
        width: width / 2,
        height: height / 13,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#009f3f',
    },
    generateText: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 34.5,
        backgroundColor: 'transparent',
        paddingLeft: 6,
    },
    separator: {
        flex: 1,
        height: 15,
    },
    textField: {
        color: 'white',
        fontFamily: 'Lato-Light',
    },
    qrContainer: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: width / 30,
        marginBottom: height / 40,
    },
    removeButtonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeButton: {
        borderColor: 'rgba(255, 255, 255, 0.6)',
        borderWidth: 1.5,
        borderRadius: 8,
        width: width / 2.7,
        height: height / 17,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    removeText: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 34.5,
        backgroundColor: 'transparent',
    },
});

const mapStateToProps = state => ({
    tempAccount: state.tempAccount,
    account: state.account,
});

const mapDispatchToProps = dispatch => ({
    generateNewAddress: (seed, seedName, addresses) => dispatch(generateNewAddress(seed, seedName, addresses)),
    setReceiveAddress: payload => dispatch(setReceiveAddress(payload)),
    generateNewAddressRequest: () => dispatch(generateNewAddressRequest()),
    generateNewAddressError: () => dispatch(generateNewAddressError()),
});

Receive.propTypes = {
    tempAccount: PropTypes.object.isRequired,
    generateNewAddress: PropTypes.func.isRequired,
    setReceiveAddress: PropTypes.func.isRequired,
};

export default translate(['receive', 'global'])(connect(mapStateToProps, mapDispatchToProps)(Receive));
