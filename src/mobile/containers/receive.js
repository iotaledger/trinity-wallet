import get from 'lodash/get';
import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import {
    ActivityIndicator,
    StyleSheet,
    View,
    Text,
    ListView,
    TouchableOpacity,
    Clipboard,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { connect } from 'react-redux';
import {
    generateNewAddress,
    setReceiveAddress,
    generateNewAddressRequest,
    generateNewAddressError,
} from 'iota-wallet-shared-modules/actions/tempAccount';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { TextField } from 'react-native-material-textfield';
import keychain, { getSeed } from '../util/keychain';
import GENERAL from '../theme/general';

import { width, height } from '../util/dimensions';
import { isAndroid } from '../util/device';

class Receive extends Component {
    static propTypes = {
        tempAccount: PropTypes.object.isRequired,
        generateNewAddress: PropTypes.func.isRequired,
        setReceiveAddress: PropTypes.func.isRequired,
        generateNewAddressRequest: PropTypes.func.isRequired,
        generateNewAddressError: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
    };

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
        const { t } = this.props;

        if (this.props.tempAccount.isSyncing) {
            return this.props.generateAlert('error', 'Syncing in process', 'Please wait until syncing is complete.');
        }

        this.props.generateNewAddressRequest();
        const seedIndex = this.props.tempAccount.seedIndex;
        const accountName = this.props.account.seedNames[seedIndex];
        const accountInfo = this.props.account.accountInfo;
        const currentSeedAccountInfo = accountInfo[Object.keys(accountInfo)[seedIndex]];
        const addresses = currentSeedAccountInfo.addresses;

        const generate = (seed, accountName, addresses) => this.props.generateNewAddress(seed, accountName, addresses);

        const error = () => {
            this.props.generateNewAddressError();
            this.props.generateAlert(
                'error',
                t('global:somethingWentWrong'),
                t('global:somethingWentWrongExplanation'),
            );
        };

        return keychain
            .get()
            .then(credentials => {
                if (get(credentials, 'data')) {
                    const seed = getSeed(credentials.data, seedIndex);
                    generate(seed, accountName, addresses);
                } else {
                    error();
                }
            })
            .catch(err => console.log(err));
    }

    onAddressPress(address) {
        const { t } = this.props;

        if (address !== ' ') {
            Clipboard.setString(address);
            this.props.generateAlert('success', t('addressCopied'), t('addressCopiedExplanation'));
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
        // FIXME: Unresolved method.
        this.props.closeTopBar();
        Keyboard.dismiss();
    }

    render() {
        const { tempAccount: { receiveAddress, isGeneratingReceiveAddress }, t } = this.props;
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
                                value={JSON.stringify({ address: receiveAddress, message: message })}
                                size={height / 5}
                                bgColor="#000"
                                fgColor="#FFF"
                            />
                        </View>
                        {receiveAddress.length > 1 && (
                            <TouchableOpacity onPress={() => this.onAddressPress(receiveAddress)}>
                                <View style={styles.receiveAddressContainer}>
                                    <Text style={styles.receiveAddressText}>{receiveAddress.substring(0, 18)}</Text>
                                    <Text style={styles.receiveAddressText}>{receiveAddress.substring(18, 36)}</Text>
                                    <Text style={styles.receiveAddressText}>{receiveAddress.substring(36, 54)}</Text>
                                    <Text style={styles.receiveAddressText}>{receiveAddress.substring(54, 72)}</Text>
                                    <Text style={styles.receiveAddressText}>{receiveAddress.substring(72, 90)}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        {receiveAddress.length <= 1 && (
                            // Place holder
                            <TouchableOpacity onPress={() => this.onAddressPress(receiveAddress)}>
                                <View style={styles.receiveAddressContainer}>
                                    <Text style={styles.receiveAddressText}>{Array(19).join(' ')}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
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
                            returnKeyType="done"
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
        borderRadius: GENERAL.borderRadius,
        height: width / 3.4,
        justifyContent: 'center',
        padding: width / 30,
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
        textAlign: 'center',
    },
    generateButton: {
        borderColor: 'rgba(255, 255, 255, 0.6)',
        borderWidth: 1.5,
        borderRadius: GENERAL.borderRadiusLarge,
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
        borderRadius: GENERAL.borderRadiusLarge,
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
        borderRadius: GENERAL.borderRadius,
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

const mapDispatchToProps = {
    generateNewAddress,
    setReceiveAddress,
    generateNewAddressRequest,
    generateNewAddressError,
    generateAlert,
};

export default translate(['receive', 'global'])(connect(mapStateToProps, mapDispatchToProps)(Receive));
