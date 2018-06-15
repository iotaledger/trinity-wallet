import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Clipboard,
    TouchableWithoutFeedback,
    Keyboard,
    PermissionsAndroid,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Share from 'react-native-share';
import { captureRef } from 'react-native-view-shot';
import { connect } from 'react-redux';
import { generateNewAddress, setReceiveAddress } from 'iota-wallet-shared-modules/actions/wallet';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { selectAccountInfo, getSelectedAccountName } from 'iota-wallet-shared-modules/selectors/accounts';
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
import { getAddressGenFn } from '../utils/nativeModules';
import { leaveNavigationBreadcrumb } from '../utils/bugsnag';

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
        width: width / 1.15,
    },
    receiveAddressText: {
        fontFamily: 'Inconsolata-Bold',
        fontSize: GENERAL.fontSize4,
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
        fontFamily: 'SourceSansPro-Bold',
        fontSize: GENERAL.fontSize1,
        backgroundColor: 'transparent',
    },
});

/** Receive screen component */
class Receive extends Component {
    static propTypes = {
        /** Currently selected account information - Contains addresses, transfers and balance */
        selectedAccountData: PropTypes.object.isRequired,
        /** Name of currently selected account */
        selectedAccountName: PropTypes.string.isRequired,
        /** Determines whether the wallet is manually syncing */
        isSyncing: PropTypes.bool.isRequired,
        /** Hash for wallet's password */
        password: PropTypes.string.isRequired,
        /** Receive address value */
        receiveAddress: PropTypes.string.isRequired,
        /** Determines whether the wallet is generating a new receive address */
        isGeneratingReceiveAddress: PropTypes.bool.isRequired,
        /** Determines whether the wallet is fetching sensitive info from keychain */
        isGettingSensitiveInfoToGenerateAddress: PropTypes.bool.isRequired,
        /** Generate receive address
         * @param {string} seed
         * @param {string} selectedAccountName
         * @param {string} selectedAccountData
         * @param {string} genFn - Native address generation function
         */
        generateNewAddress: PropTypes.func.isRequired,
        /** Close active top bar */
        closeTopBar: PropTypes.func.isRequired,
        /** Set receive address in reducer
         * @param {string} address
         */
        setReceiveAddress: PropTypes.func.isRequired,
        /** Generate a notification alert
         * @param {string} type - notification type - success, error
         * @param {string} title - notification title
         * @param {string} text - notification explanation
         */
        generateAlert: PropTypes.func.isRequired,
        /** Request keychain access
         * @param {string} screen - Active screen
         * @param {string} purpose - Purpose for accessing keychain e.g: addressGeneration
         */
        getFromKeychainRequest: PropTypes.func.isRequired,
        /** Successful keychain access callback function
         * @param {string} screen - Active screen
         * @param {string} purpose - Purpose for accessing keychain e.g: addressGeneration
         */
        getFromKeychainSuccess: PropTypes.func.isRequired,
        /** On error callback function for keychain access
         * @param {string} screen - Active screen
         * @param {string} purpose - Purpose for accessing keychain e.g: addressGeneration
         */
        getFromKeychainError: PropTypes.func.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Determines whether the wallet is doing a snapshot tranisition */
        isTransitioning: PropTypes.bool.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
    };

    constructor() {
        super();

        this.state = {
            message: '',
        };

        this.onGeneratePress = this.onGeneratePress.bind(this);
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('Receive');
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
        const genFn = getAddressGenFn();
        this.props.generateNewAddress(seed, selectedAccountName, selectedAccountData, genFn);
    }

    onAddressPress(address) {
        const { t } = this.props;

        if (address !== ' ') {
            Clipboard.setString(address);
            this.props.generateAlert('success', t('addressCopied'), t('addressCopiedExplanation'));
        }
    }

    async onQRPress() {
        const { t, receiveAddress } = this.props;
        // Ensure user has granted necessary permission on Android
        if (isAndroid) {
            const hasPermission = await this.getFileSystemPermissions();
            if (!hasPermission) {
                return this.props.generateAlert('error', t('missingPermission'), t('missingPermissionExplanation'));
            }
        }
        if (receiveAddress !== ' ') {
            captureRef(this.qr, { format: 'png', result: 'data-uri' }).then((url) => {
                Share.open({
                    url,
                    type: 'image/png',
                }).catch((err) => {
                    // Handling promise rejection from `react-native-share` so that Bugsnag does not report it as an error
                    /*eslint-disable no-console*/
                    console.log(err);
                });
            });
        }
    }

    async getFileSystemPermissions() {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            return true;
        }
        return false;
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
            if (isAndroid) {
                return 0.01;
            }
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
            theme,
            isGeneratingReceiveAddress,
            isGettingSensitiveInfoToGenerateAddress,
        } = this.props;
        const message = this.state.message;
        const borderColor = { borderColor: theme.body.color };
        const opacity = { opacity: this.getOpacity() };
        const qrOpacity = { opacity: this.getQrOpacity() };

        return (
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => this.clearInteractions()}>
                <View style={styles.container}>
                    <View style={{ flex: 0.55 }} />
                    {/*eslint-disable no-return-assign*/}
                    <TouchableOpacity onPress={() => this.onQRPress()}>
                        <View
                            style={[styles.qrContainer, qrOpacity, { borderColor: 'transparent' }]}
                            ref={(c) => (this.qr = c)}
                        >
                            <QRCode
                                value={JSON.stringify({ address: receiveAddress, message })}
                                size={width / 2.8}
                                color="black"
                                backgroundColor="transparent"
                            />
                        </View>
                    </TouchableOpacity>
                    {/*eslint-enable no-return-assign*/}
                    <View style={{ flex: 0.25 }} />
                    {receiveAddress.length > 1 ? (
                        <TouchableOpacity onPress={() => this.onAddressPress(receiveAddress)}>
                            <View style={[styles.receiveAddressContainer, { backgroundColor: theme.input.bg }]}>
                                <Text style={[styles.receiveAddressText, { color: theme.input.color }]}>
                                    {receiveAddress.substring(0, 30)}
                                </Text>
                                <Text style={[styles.receiveAddressText, { color: theme.input.color }]}>
                                    {receiveAddress.substring(30, 60)}
                                </Text>
                                <Text style={[styles.receiveAddressText, { color: theme.input.color }]}>
                                    {receiveAddress.substring(60, 90)}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ) : (
                        // Place holder
                        <TouchableOpacity onPress={() => this.onAddressPress(receiveAddress)}>
                            <View
                                style={[styles.receiveAddressContainer, { backgroundColor: theme.input.bg }, opacity]}
                            >
                                <Text style={[styles.receiveAddressText, { color: theme.input.color }]}>
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
                        containerStyle={{ width: width / 1.15 }}
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
                                            <Text style={[styles.removeText, { color: theme.body.color }]}>
                                                {t('removeMessage')}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                    <View style={{ flex: 0.2 }} />
                                </View>
                            )) || (
                            <GenerateAddressButton
                                ctaBorderColor={theme.primary.hover}
                                primaryColor={theme.primary.color}
                                primaryBody={theme.primary.body}
                                t={t}
                                receiveAddress={receiveAddress}
                                isGettingSensitiveInfoToGenerateAddress={isGettingSensitiveInfoToGenerateAddress}
                                isGeneratingReceiveAddress={isGeneratingReceiveAddress}
                                onGeneratePress={this.onGeneratePress}
                                message={message}
                            />
                        )}
                    </View>
                    <View style={{ flex: 0.55 }} />
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    selectedAccountData: selectAccountInfo(state),
    selectedAccountName: getSelectedAccountName(state),
    isSyncing: state.ui.isSyncing,
    seedIndex: state.wallet.seedIndex,
    receiveAddress: state.wallet.receiveAddress,
    isGeneratingReceiveAddress: state.ui.isGeneratingReceiveAddress,
    isGettingSensitiveInfoToGenerateAddress: state.keychain.isGettingSensitiveInfo.receive.addressGeneration,
    theme: state.settings.theme,
    isTransitioning: state.ui.isTransitioning,
    password: state.wallet.password,
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
