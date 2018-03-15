import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, TouchableOpacity, Clipboard, TouchableWithoutFeedback, Keyboard } from 'react-native';
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
import { getSeedFromKeychain } from '../utils/keychain';
import GENERAL from '../theme/general';
import CustomTextInput from '../components/CustomTextInput';
import GenerateAddressButton from '../components/GenerateAddressButton';
import { width, height } from '../utils/dimensions';
import { isAndroid } from '../utils/device';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    receiveAddressContainer: {
        borderRadius: GENERAL.borderRadius,
        height: width / 4.2,
        justifyContent: 'center',
        paddingHorizontal: width / 30,
        width: width / 1.2,
    },
    receiveAddressText: {
        fontFamily: 'Inconsolata-Bold',
        fontSize: width / 21.8,
        backgroundColor: 'transparent',
        textAlign: 'center',
        lineHeight: width / 16,
        justifyContent: 'center',
    },
    qrContainer: {
        borderRadius: GENERAL.borderRadius,
        padding: width / 30,
        backgroundColor: 'white',
        borderWidth: 2,
        width: width / 2.2,
        alignItems: 'center',
        justifyContent: 'center',
        height: width / 2.2,
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

class Receive extends Component {
    static propTypes = {
        selectedAccountData: PropTypes.object.isRequired,
        selectedAccountName: PropTypes.string.isRequired,
        isSyncing: PropTypes.bool.isRequired,
        password: PropTypes.string.isRequired,
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
        theme: PropTypes.object.isRequired,
        body: PropTypes.object.isRequired,
        input: PropTypes.object.isRequired,
        primary: PropTypes.object.isRequired,
        isTransitioning: PropTypes.bool.isRequired,
        t: PropTypes.func.isRequired,
    };

    constructor() {
        super();

        this.state = {
            message: '',
        };
        this.onGeneratePress = this.onGeneratePress.bind(this);
    }

    shouldComponentUpdate(newProps) {
        const { isSyncing, isTransitioning } = this.props;

        if (isSyncing !== newProps.isSyncing) {
            return false;
        }

        if (isTransitioning !== newProps.isTransitioning) {
            return false;
        }

        return true;
    }

    componentWillUnmount() {
        this.resetAddress();
    }

    async onGeneratePress() {
        const { t, selectedAccountData, selectedAccountName, isSyncing, isTransitioning, password } = this.props;

        if (isSyncing || isTransitioning) {
            return this.props.generateAlert('error', t('global:pleaseWait'), t('global:pleaseWaitExplanation'));
        }

        const error = () => {
            this.props.getFromKeychainError('receive', 'addressGeneration');
            return this.props.generateAlert(
                'error',
                t('global:somethingWentWrong'),
                t('global:somethingWentWrongTryAgain'),
            );
        };

        this.props.getFromKeychainRequest('receive', 'addressGeneration');
        const seed = await getSeedFromKeychain(password, selectedAccountName);
        if (seed === null) {
            return error();
        }
        this.props.getFromKeychainSuccess('receive', 'addressGeneration');
        this.props.generateNewAddress(seed, selectedAccountName, selectedAccountData);
    }

    onAddressPress(address) {
        const { t } = this.props;

        if (address !== ' ') {
            Clipboard.setString(address);
            this.props.generateAlert('success', t('addressCopied'), t('addressCopiedExplanation'));
        }
    }

    getOpacity() {
        if (!isAndroid) {
            return 0.2;
        }
        return 0.1;
    }

    getQrOpacity() {
        const { receiveAddress } = this.props;
        if (receiveAddress === ' ') {
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
            t,
            body,
            theme,
            primary,
            input,
            isGeneratingReceiveAddress,
            isGettingSensitiveInfoToGenerateAddress,
        } = this.props;
        const message = this.state.message;
        const borderColor = { borderColor: body.color };
        const opacity = { opacity: this.getOpacity() };
        const qrOpacity = { opacity: this.getQrOpacity() };

        return (
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => this.clearInteractions()}>
                <View style={styles.container}>
                    <View style={{ flex: 0.4 }} />
                    <View style={[styles.qrContainer, qrOpacity, { borderColor: 'transparent' }]}>
                        <QRCode
                            value={JSON.stringify({ address: receiveAddress, message })}
                            size={width / 2.8}
                            color="black"
                            backgroundColor="transparent"
                        />
                    </View>
                    <View style={{ flex: 0.25 }} />
                    {receiveAddress.length > 1 ? (
                        <TouchableOpacity onPress={() => this.onAddressPress(receiveAddress)}>
                            <View style={[styles.receiveAddressContainer, { backgroundColor: input.bg }]}>
                                <Text style={[styles.receiveAddressText, { color: input.color }]}>
                                    {receiveAddress.substring(0, 30)}
                                </Text>
                                <Text style={[styles.receiveAddressText, { color: input.color }]}>
                                    {receiveAddress.substring(30, 60)}
                                </Text>
                                <Text style={[styles.receiveAddressText, { color: input.color }]}>
                                    {receiveAddress.substring(60, 90)}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ) : (
                        // Place holder
                        <TouchableOpacity onPress={() => this.onAddressPress(receiveAddress)}>
                            <View style={[styles.receiveAddressContainer, { backgroundColor: input.bg }, opacity]}>
                                <Text style={[styles.receiveAddressText, { color: input.color }]}>
                                    {Array(19).join(' ')}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    <View style={{ flex: 0.2 }} />
                    <CustomTextInput
                        onRef={(c) => {
                            this.messageField = c;
                        }}
                        label={t('message')}
                        onChangeText={(text) => this.setState({ message: text })}
                        containerStyle={{ width: width / 1.2 }}
                        autoCorrect={false}
                        enablesReturnKeyAutomatically
                        returnKeyType="done"
                        value={message}
                        theme={theme}
                    />
                    <View style={{ flex: 0.35 }} />
                    <View style={{ flex: 0.7 }}>
                        {(receiveAddress.length > 1 &&
                            message.length >= 1 && (
                                <View style={{ flex: 0.7 }}>
                                    <View style={{ flex: 0.1 }} />
                                    <TouchableOpacity
                                        onPress={() => {
                                            // Check if there's already a network call in progress.
                                            this.setState({ message: '' });
                                            this.messageField.blur();
                                        }}
                                        style={styles.removeButtonContainer}
                                    >
                                        <View style={[styles.removeButton, borderColor]}>
                                            <Text style={[styles.removeText, { color: body.color }]}>
                                                {t('removeMessage')}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                    <View style={{ flex: 0.2 }} />
                                </View>
                            )) || (
                            <GenerateAddressButton
                                ctaBorderColor={primary.hover}
                                primaryColor={primary.color}
                                primaryBody={primary.body}
                                t={t}
                                receiveAddress={receiveAddress}
                                isGettingSensitiveInfoToGenerateAddress={isGettingSensitiveInfoToGenerateAddress}
                                isGeneratingReceiveAddress={isGeneratingReceiveAddress}
                                onGeneratePress={this.onGeneratePress}
                                message={message}
                            />
                        )}
                    </View>
                    <View style={{ flex: 0.65 }} />
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    selectedAccountData: getSelectedAccountViaSeedIndex(state.tempAccount.seedIndex, state.account.accountInfo),
    selectedAccountName: getSelectedAccountNameViaSeedIndex(state.tempAccount.seedIndex, state.account.accountNames),
    isSyncing: state.tempAccount.isSyncing,
    seedIndex: state.tempAccount.seedIndex,
    receiveAddress: state.tempAccount.receiveAddress,
    isGeneratingReceiveAddress: state.tempAccount.isGeneratingReceiveAddress,
    isGettingSensitiveInfoToGenerateAddress: state.keychain.isGettingSensitiveInfo.receive.addressGeneration,
    theme: state.settings.theme,
    primary: state.settings.theme.primary,
    input: state.settings.theme.input,
    body: state.settings.theme.body,
    isTransitioning: state.tempAccount.isTransitioning,
    password: state.tempAccount.password,
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
