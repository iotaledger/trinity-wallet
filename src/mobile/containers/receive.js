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
import { generateNewAddress, setReceiveAddress } from 'iota-wallet-shared-modules/actions/tempAccount';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import {
    getSelectedAccountViaSeedIndex,
    getSelectedAccountNameViaSeedIndex,
} from 'iota-wallet-shared-modules/selectors/account';
import {
    getFromKeychainRequest,
    getFromKeychainSuccess,
    getFromKeychainError,
} from 'iota-wallet-shared-modules/actions/keychain';
import { TextField } from 'react-native-material-textfield';
import keychain, { getSeed } from '../util/keychain';
import GENERAL from '../theme/general';
import THEMES from '../theme/themes';

import { width, height } from '../util/dimensions';
import { isAndroid } from '../util/device';

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

class Receive extends Component {
    static propTypes = {
        selectedAccount: PropTypes.object.isRequired,
        selectedAccountName: PropTypes.string.isRequired,
        isSyncing: PropTypes.bool.isRequired,
        seedIndex: PropTypes.number.isRequired,
        receiveAddress: PropTypes.string.isRequired,
        isGeneratingReceiveAddress: PropTypes.bool.isRequired,
        isGettingSensitiveInfoToGenerateAddress: PropTypes.bool.isRequired,
        generateNewAddress: PropTypes.func.isRequired,
        closeTopBar: PropTypes.func.isRequired,
        setReceiveAddress: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        getFromKeychainRequest: PropTypes.func.isRequired,
        getFromKeychainSuccess: PropTypes.func.isRequired,
        getFromKeychainError: PropTypes.func.isRequired,
        ctaColor: PropTypes.object.isRequired,
        negativeColor: PropTypes.object.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        secondaryCtaColor: PropTypes.string.isRequired,
    };

    constructor() {
        super();

        this.state = {
            dataSource: ds.cloneWithRows([]),
            message: '',
        };

        this.onGeneratePress = this.onGeneratePress.bind(this);
    }

    componentWillUnmount() {
        this.resetAddress();
    }

    onAddressPress(address) {
        const { t } = this.props;

        if (address !== ' ') {
            Clipboard.setString(address);
            this.props.generateAlert('success', t('addressCopied'), t('addressCopiedExplanation'));
        }
    }

    onGeneratePress() {
        const { t, seedIndex, selectedAccount, selectedAccountName, isSyncing } = this.props;

        if (isSyncing) {
            return this.props.generateAlert('error', 'Syncing in process', 'Please wait until syncing is complete.');
        }

        const error = () => {
            this.props.getFromKeychainError('receive', 'addressGeneration');
            this.props.generateAlert(
                'error',
                t('global:somethingWentWrong'),
                t('global:somethingWentWrongExplanation'),
            );
        };

        this.props.getFromKeychainRequest('receive', 'addressGeneration');
        return keychain
            .get()
            .then((credentials) => {
                this.props.getFromKeychainSuccess('receive', 'addressGeneration');

                if (get(credentials, 'data')) {
                    const seed = getSeed(credentials.data, seedIndex);
                    this.props.generateNewAddress(seed, selectedAccountName, selectedAccount.addresses);
                } else {
                    error();
                }
            })
            .catch(() => this.props.getFromKeychainError('receive', 'addressGeneration'));
    }

    getOpacity() {
        const { receiveAddress } = this.props;
        if (receiveAddress === ' ') {
            return 0.1;
        }

        return 1;
    }

    getQrOpacity() {
        const { receiveAddress } = this.props;
        if (receiveAddress === ' ' && isAndroid) {
            return 0.1;
        }

        return 1;
    }

    resetAddress() {
        const { receiveAddress } = this.props;
        if (receiveAddress) {
            this.props.setReceiveAddress(' ');
        }
    }

    clearInteractions() {
        this.props.closeTopBar();
        Keyboard.dismiss();
    }

    render() {
        const {
            receiveAddress,
            isGeneratingReceiveAddress,
            isGettingSensitiveInfoToGenerateAddress,
            t,
            ctaColor,
            negativeColor,
            secondaryBackgroundColor,
            secondaryCtaColor,
            ctaBorderColor,
        } = this.props;
        const message = this.state.message;
        const textColor = { color: secondaryBackgroundColor };
        const ctaTextColor = { color: secondaryCtaColor };
        const generateBorderColor = { borderColor: ctaBorderColor };
        const borderColor = { borderColor: secondaryBackgroundColor };
        const qrBorder =
            secondaryBackgroundColor === 'white' ? { borderColor: 'transparent' } : { borderColor: 'black' };

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
                        <View style={[styles.qrContainer, { opacity: this.getQrOpacity() }, qrBorder]}>
                            <QRCode
                                value={JSON.stringify({ address: receiveAddress, message })}
                                size={height / 5}
                                color={'black'}
                            />
                        </View>
                        {receiveAddress.length > 1 && (
                            <TouchableOpacity onPress={() => this.onAddressPress(receiveAddress)}>
                                <View style={[styles.receiveAddressContainer, borderColor]}>
                                    <Text style={[styles.receiveAddressText, textColor]}>
                                        {receiveAddress.substring(0, 18)}
                                    </Text>
                                    <Text style={[styles.receiveAddressText, textColor]}>
                                        {receiveAddress.substring(18, 36)}
                                    </Text>
                                    <Text style={[styles.receiveAddressText, textColor]}>
                                        {receiveAddress.substring(36, 54)}
                                    </Text>
                                    <Text style={[styles.receiveAddressText, textColor]}>
                                        {receiveAddress.substring(54, 72)}
                                    </Text>
                                    <Text style={[styles.receiveAddressText, textColor]}>
                                        {receiveAddress.substring(72, 90)}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        {receiveAddress.length <= 1 && (
                            // Place holder
                            <TouchableOpacity onPress={() => this.onAddressPress(receiveAddress)}>
                                <View style={[styles.receiveAddressContainer, borderColor]}>
                                    <Text style={[styles.receiveAddressText, textColor]}>{Array(19).join(' ')}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={{ alignItems: 'center', flex: 0.5, justifyContent: 'flex-start' }}>
                        <TextField
                            style={[styles.textField, textColor]}
                            labelTextStyle={{ fontFamily: 'Lato-Light', color: secondaryBackgroundColor }}
                            labelFontSize={height / 55}
                            fontSize={height / 40}
                            labelPadding={3}
                            baseColor={secondaryBackgroundColor}
                            tintColor={THEMES.getHSL(negativeColor)}
                            enablesReturnKeyAutomatically={true}
                            returnKeyType="done"
                            label={t('message')}
                            autoCorrect={false}
                            value={message}
                            containerStyle={{ width: width / 1.36 }}
                            onChangeText={(message) => this.setState({ message })}
                            ref="message"
                        />
                    </View>
                    <View style={{ flex: 0.5, justifyContent: 'center' }}>
                        {receiveAddress === ' ' &&
                            (!isGeneratingReceiveAddress && !isGettingSensitiveInfoToGenerateAddress) && (
                                <TouchableOpacity
                                    onPress={() => {
                                        // Check if there's already a network call in progress.
                                        if (!isGeneratingReceiveAddress) {
                                            this.onGeneratePress();
                                        }
                                    }}
                                >
                                    <View
                                        style={[
                                            styles.generateButton,
                                            { backgroundColor: THEMES.getHSL(ctaColor) },
                                            generateBorderColor,
                                        ]}
                                    >
                                        <Text style={[styles.generateText, ctaTextColor]}>
                                            {t('generateNewAddress')}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        {(isGettingSensitiveInfoToGenerateAddress || isGeneratingReceiveAddress) && (
                            <View style={{ height: height / 10 }}>
                                <ActivityIndicator
                                    animating={isGeneratingReceiveAddress || isGettingSensitiveInfoToGenerateAddress}
                                    style={styles.activityIndicator}
                                    size="large"
                                    color={THEMES.getHSL(negativeColor)}
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
                                    <View style={[styles.removeButton, borderColor]}>
                                        <Text style={[styles.removeText, textColor]}>{t('removeMessage')}</Text>
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
        borderWidth: 1,
        borderRadius: GENERAL.borderRadius,
        height: width / 3.4,
        justifyContent: 'center',
        paddingTop: width / 30,
        paddingHorizontal: width / 30,
        paddingBottom: isAndroid ? width / 22 : width / 30,
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
        backgroundColor: 'transparent',
        textAlign: 'center',
        height: width / 20,
        justifyContent: 'center',
    },
    generateButton: {
        borderRadius: GENERAL.borderRadiusLarge,
        width: width / 2,
        height: height / 13,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
    },
    generateText: {
        fontFamily: 'Lato-Bold',
        fontSize: width / 34.5,
        backgroundColor: 'transparent',
        paddingLeft: 6,
        color: 'white',
    },
    separator: {
        flex: 1,
        height: 15,
    },
    textField: {
        fontFamily: 'Lato-Light',
    },
    qrContainer: {
        borderRadius: GENERAL.borderRadiusLarge,
        padding: width / 30,
        marginBottom: height / 40,
        backgroundColor: 'white',
        borderWidth: 2,
    },
    removeButtonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeButton: {
        borderWidth: 1.5,
        borderRadius: GENERAL.borderRadius,
        width: width / 2.7,
        height: height / 17,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    removeText: {
        fontFamily: 'Lato-Bold',
        fontSize: width / 34.5,
        backgroundColor: 'transparent',
    },
});

const mapStateToProps = (state) => ({
    selectedAccount: getSelectedAccountViaSeedIndex(state.tempAccount.seedIndex, state.account.accountInfo),
    selectedAccountName: getSelectedAccountNameViaSeedIndex(state.tempAccount.seedIndex, state.account.seedNames),
    isSyncing: state.tempAccount.isSyncing,
    seedIndex: state.tempAccount.seedIndex,
    receiveAddress: state.tempAccount.receiveAddress,
    isGeneratingReceiveAddress: state.tempAccount.isGeneratingReceiveAddress,
    isGettingSensitiveInfoToGenerateAddress: state.keychain.isGettingSensitiveInfo.receive.addressGeneration,
    ctaColor: state.settings.theme.ctaColor,
    negativeColor: state.settings.theme.negativeColor,
    secondaryBackgroundColor: state.settings.theme.secondaryBackgroundColor,
    secondaryCtaColor: state.settings.theme.secondaryCtaColor,
    ctaBorderColor: state.settings.theme.ctaBorderColor,
});

const mapDispatchToProps = {
    generateNewAddress,
    setReceiveAddress,
    generateAlert,
    getFromKeychainRequest,
    getFromKeychainSuccess,
    getFromKeychainError,
};

export default translate(['receive', 'global'])(connect(mapStateToProps, mapDispatchToProps)(Receive));
