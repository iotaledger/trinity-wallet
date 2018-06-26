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
    Animated,
    Easing,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Share from 'react-native-share';
import { captureRef } from 'react-native-view-shot';
import { connect } from 'react-redux';
import { generateNewAddress } from 'iota-wallet-shared-modules/actions/wallet';
import { flipReceiveCard } from 'iota-wallet-shared-modules/actions/ui';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { selectAccountInfo, getSelectedAccountName } from 'iota-wallet-shared-modules/selectors/accounts';
import { getCurrencySymbol, getIOTAUnitMultiplier } from 'iota-wallet-shared-modules/libs/currency';
import {
    getFromKeychainRequest,
    getFromKeychainSuccess,
    getFromKeychainError,
} from 'iota-wallet-shared-modules/actions/keychain';
import { isValidAmount } from 'iota-wallet-shared-modules/libs/iota/utils';
import { getSeedFromKeychain } from '../utils/keychain';
import GENERAL from '../theme/general';
import MultiTextInput from '../components/MultiTextInput';
import { Icon } from '../theme/icons.js';
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
    flipCard: {
        width: width / 1.15,
        height: height / 1.5,
        borderRadius: 6,
        backfaceVisibility: 'hidden',
    },
    flipCardBack: {
        width: width / 1.15,
        height: height / 1.5,
        borderRadius: 6,
        position: 'absolute',
        top: 0,
    },
    headerButtonsContainer: {
        flex: 1.3,
        flexDirection: 'row',
        borderTopRightRadius: 6,
        borderTopLeftRadius: 6,
    },
    qrContainerFront: {
        flex: 3.6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qrContainerBack: {
        flex: 3.9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qrFrame: {
        padding: width / 20,
        backgroundColor: 'white',
    },
    addressContainer: {
        flex: 2.9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    multiInputContainer: {
        flex: 2.6,
        justifyContent: 'center',
        paddingHorizontal: width / 30,
        paddingVertical: height / 50,
    },
    addressButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerButtonContainer: {
        flex: 1.3,
    },
    leftHeaderButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 6,
    },
    rightHeaderButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopRightRadius: 6,
    },
    footerButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: GENERAL.borderRadius,
        borderBottomRightRadius: GENERAL.borderRadius,
    },
    refreshIconBackgroundAndroid: {
        width: width / 7,
        height: width / 7,
        borderRadius: width / 4,
        position: 'absolute',
        bottom: -width / 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    refreshIconBackground: {
        width: width / 7,
        height: width / 7,
        borderRadius: width / 4,
        position: 'absolute',
        top: -width / 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    refreshIcon: {
        backgroundColor: 'transparent',
    },
    buttonText: {
        fontFamily: 'SourceSansPro-SemiBold',
        fontSize: GENERAL.fontSize3,
    },
    addressText: {
        fontFamily: 'SourceCodePro-Medium',
        fontSize: GENERAL.fontSize3,
        textAlign: 'center',
        lineHeight: width / 17,
        justifyContent: 'center',
    },
    qrOptionsIndicator: {
        width: width / 60,
        height: width / 60,
        borderRadius: width / 30,
        position: 'absolute',
        top: width / 40,
        right: width / 40,
        zIndex: 2,
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
        /** Determines whether card has been flipped */
        isCardFlipped: PropTypes.bool.isRequired,
        /** Flips card between Your Address and QR Options */
        flipReceiveCard: PropTypes.func.isRequired,
        qrMessage: PropTypes.string.isRequired,
        qrAmount: PropTypes.string.isRequired,
        qrTag: PropTypes.string.isRequired,
        qrDenomination: PropTypes.string.isRequired,
        currency: PropTypes.string.isRequired,
        usdPrice: PropTypes.number.isRequired,
        conversionRate: PropTypes.number.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            currencySymbol: getCurrencySymbol(props.currency),
        };
        this.onGeneratePress = this.onGeneratePress.bind(this);
        this.flipCard = this.flipCard.bind(this);
    }

    componentWillMount() {
        const value = this.props.isCardFlipped ? 1 : 0;

        this.rotateAnimatedValue = new Animated.Value(0);
        this.flipAnimatedValue = new Animated.Value(value);
        this.scaleAnimatedValueFront = new Animated.Value(value);
        this.scaleAnimatedValueBack = new Animated.Value(value);
        this.opacityAnimatedValue = new Animated.Value(value);

        this.rotateInterpolate = this.rotateAnimatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
        });
        this.flipInterpolateFront = this.flipAnimatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '180deg'],
        });
        this.flipInterpolateBack = this.flipAnimatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['180deg', '360deg'],
        });
        this.scaleInterpolateFront = this.scaleAnimatedValueFront.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0.875],
        });
        this.scaleInterpolateBack = this.scaleAnimatedValueBack.interpolate({
            inputRange: [0, 1],
            outputRange: [0.875, 1],
        });
        this.frontOpacity = this.opacityAnimatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0],
        });
        this.backOpacity = this.opacityAnimatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
        });
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

    /**
     *   Gets seed from keychain and generates receive address.
     *   @method onGeneratePress
     **/
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
        this.rotateIcon();
        const seed = await getSeedFromKeychain(password, selectedAccountName);
        if (seed === null) {
            return error();
        }
        this.props.getFromKeychainSuccess('receive', 'addressGeneration');
        const genFn = getAddressGenFn();
        this.props.generateNewAddress(seed, selectedAccountName, selectedAccountData, genFn);
    }

    /**
     *   Copies receive address to clipboard.
     *   @method onCopyAddressPress
     **/
    onCopyAddressPress() {
        const { t, receiveAddress } = this.props;
        Clipboard.setString(receiveAddress);
        this.props.generateAlert('success', t('addressCopied'), t('addressCopiedExplanation'));
    }

    /**
     *   Captures QR code and opens share intent.
     *   @method onShareQRCodePress
     **/
    async onShareQRCodePress() {
        const { t, receiveAddress } = this.props;
        // Ensure user has granted necessary permission on Android
        if (isAndroid) {
            const hasPermission = await this.getAndroidFileSystemPermissions();
            if (!hasPermission) {
                return this.props.generateAlert('error', t('missingPermission'), t('missingPermissionExplanation'));
            }
        }
        if (receiveAddress) {
            captureRef(this.qr, { format: 'png', result: 'data-uri' }).then((url) => {
                Share.open({
                    url,
                    type: 'image/png',
                }).catch((err) => {
                    // Handles promise rejection from `react-native-share` so that Bugsnag does not report it as an error
                    /*eslint-disable no-console*/
                    console.log(err);
                });
            });
        }
    }

    /**
     *   Gets Android file system permissions necessary for sharing QR Codes.
     *   @method getAndroidFileSystemPermissions
     *   @returns {boolean}
     **/
    async getAndroidFileSystemPermissions() {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            return true;
        }
        return false;
    }

    /**
     *   Gets transaction value for QR code JSON.
     *   If amount field is empty or invalid set value to 0.
     *   @method getQrValue
     *   @returns {number}
     **/
    getQrValue() {
        const { qrAmount, qrDenomination } = this.props;
        const { currencySymbol } = this.state;
        const isFiat = qrDenomination === currencySymbol;
        const formattedAmount = isValidAmount(qrAmount, this.getUnitMultiplier(), isFiat) && qrAmount ? qrAmount : 0;
        const value = parseInt(parseFloat(formattedAmount) * this.getUnitMultiplier(), 10);
        return value;
    }

    /**
     *   Gets multiplier used in converting IOTA denominations (Ti, Gi, Mi, Ki, i) and fiat to basic IOTA unit (i) for QR Code.
     *   @method getUnitMultiplier
     *   @returns {number}
     **/
    getUnitMultiplier() {
        const { usdPrice, conversionRate, qrDenomination } = this.props;
        const currencySymbol = this.state;
        if (qrDenomination === currencySymbol) {
            return 1000000 / usdPrice / conversionRate;
        }
        return getIOTAUnitMultiplier(qrDenomination);
    }

    clearInteractions() {
        this.props.closeTopBar();
        Keyboard.dismiss();
    }

    /**
     *   Animates refresh icon while an address is being generated.
     *   @method rotateIcon
     **/
    rotateIcon() {
        this.rotateAnimatedValue.setValue(0);
        Animated.sequence([
            Animated.spring(this.rotateAnimatedValue, {
                toValue: 1,
                useNativeDriver: true,
                friction: 20,
                tension: 30,
            }),
        ]).start(() => {
            const { isGeneratingReceiveAddress, isGettingSensitiveInfoToGenerateAddress } = this.props;
            if (isGeneratingReceiveAddress || isGettingSensitiveInfoToGenerateAddress) {
                this.rotateIcon();
            }
        });
    }

    /**
     *   Animates flipcard.
     *   @method flipCard
     **/
    flipCard() {
        const { isCardFlipped } = this.props;
        const toValue = isCardFlipped ? 0 : 1;
        Animated.parallel([
            Animated.timing(isCardFlipped ? this.scaleAnimatedValueBack : this.scaleAnimatedValueFront, {
                toValue,
                duration: 100,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
            Animated.timing(this.flipAnimatedValue, {
                toValue,
                duration: 300,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
            Animated.timing(this.opacityAnimatedValue, {
                toValue,
                delay: 150,
                duration: 1,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
            Animated.timing(isCardFlipped ? this.scaleAnimatedValueFront : this.scaleAnimatedValueBack, {
                toValue,
                duration: 100,
                easing: Easing.linear,
                delay: 200,
                useNativeDriver: true,
            }),
        ]).start(() => this.props.flipReceiveCard());
    }

    render() {
        const { t, theme: { primary, dark, positive }, receiveAddress, isCardFlipped, qrMessage, qrTag } = this.props;

        const qrContent = JSON.stringify({
            address: receiveAddress,
            value: this.getQrValue(),
            message: qrMessage,
            tag: qrTag,
        });
        const qrOptionsActive = this.getQrValue() !== 0 || qrMessage.length > 0 || qrTag.length > 0;
        const rotateStyle = { rotate: this.rotateInterpolate };
        const flipStyleFront = { rotateY: this.flipInterpolateFront };
        const flipStyleBack = { rotateY: this.flipInterpolateBack };
        const scaleStyleFront = { scale: this.scaleInterpolateFront };
        const scaleStyleBack = { scale: this.scaleInterpolateBack };

        return (
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => this.clearInteractions()}>
                <View style={styles.container}>
                    <View>
                        <Animated.View
                            style={[
                                styles.flipCard,
                                { zIndex: isCardFlipped ? 0 : 1 },
                                { opacity: this.frontOpacity },
                                {
                                    transform: [{ perspective: 1000 }, flipStyleFront, scaleStyleFront],
                                },
                            ]}
                            pointerEvents={this.props.isCardFlipped ? 'none' : 'auto'}
                        >
                            {qrOptionsActive && (
                                <View style={[styles.qrOptionsIndicator, { backgroundColor: positive.color }]} />
                            )}
                            <View style={styles.headerButtonsContainer}>
                                <View style={[styles.leftHeaderButton, { backgroundColor: dark.body }]}>
                                    <Text style={[styles.buttonText, { color: dark.color }]}>{t('yourAddress')}</Text>
                                </View>
                                <TouchableWithoutFeedback onPress={this.flipCard}>
                                    <View style={[styles.rightHeaderButton, { backgroundColor: primary.color }]}>
                                        <Text style={[styles.buttonText, { color: primary.body }]}>
                                            {t('qrOptions')}
                                        </Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                            <View
                                style={[
                                    styles.qrContainerFront,
                                    { backgroundColor: dark.body, paddingBottom: width / 14 },
                                ]}
                            >
                                <QRCode
                                    value={qrContent}
                                    size={width / 3}
                                    color="black"
                                    backgroundColor="transparent"
                                />
                                {/* FIXME: Overflow: 'visible' is not supported on Android */}
                                {isAndroid && (
                                    <TouchableWithoutFeedback onPress={() => this.onGeneratePress()}>
                                        <Animated.View
                                            style={[
                                                styles.refreshIconBackgroundAndroid,
                                                { backgroundColor: dark.color },
                                                { transform: [rotateStyle] },
                                            ]}
                                        >
                                            <Icon
                                                name="sync"
                                                size={width / 12}
                                                color={dark.body}
                                                style={styles.refreshIcon}
                                            />
                                        </Animated.View>
                                    </TouchableWithoutFeedback>
                                )}
                            </View>
                            <TouchableWithoutFeedback onPress={() => this.onGeneratePress()}>
                                <View style={[styles.addressContainer, { backgroundColor: dark.color }]}>
                                    <Animated.View
                                        style={[
                                            styles.refreshIconBackground,
                                            { backgroundColor: dark.color },
                                            { transform: [rotateStyle] },
                                        ]}
                                    >
                                        <Icon
                                            name="sync"
                                            size={width / 12}
                                            color={dark.body}
                                            style={styles.refreshIcon}
                                        />
                                    </Animated.View>
                                    <Text style={[styles.addressText, { color: dark.body }]}>
                                        {receiveAddress.substring(0, 30)}
                                    </Text>
                                    <Text style={[styles.addressText, { color: dark.body }]}>
                                        {receiveAddress.substring(30, 60)}
                                    </Text>
                                    <Text style={[styles.addressText, { color: dark.body }]}>
                                        {receiveAddress.substring(60, 90)}
                                    </Text>
                                </View>
                            </TouchableWithoutFeedback>

                            <View style={styles.footerButtonContainer}>
                                <TouchableOpacity
                                    style={[styles.footerButton, { backgroundColor: primary.color }]}
                                    onPress={() => this.onCopyAddressPress()}
                                >
                                    <Text style={[styles.buttonText, { color: primary.body }]}>{t('copyAddress')}</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                        <Animated.View
                            pointerEvents={this.props.isCardFlipped ? 'auto' : 'none'}
                            style={[
                                styles.flipCard,
                                styles.flipCardBack,
                                { zIndex: isCardFlipped ? 1 : 0 },
                                { opacity: this.backOpacity },
                                {
                                    transform: [{ perspective: 1000 }, flipStyleBack, scaleStyleBack],
                                },
                            ]}
                        >
                            {qrOptionsActive && (
                                <View style={[styles.qrOptionsIndicator, { backgroundColor: positive.color }]} />
                            )}
                            <View style={styles.headerButtonsContainer}>
                                <TouchableWithoutFeedback onPress={this.flipCard}>
                                    <View style={[styles.leftHeaderButton, { backgroundColor: primary.color }]}>
                                        <Text style={[styles.buttonText, { color: primary.body }]}>
                                            {t('yourAddress')}
                                        </Text>
                                    </View>
                                </TouchableWithoutFeedback>
                                <View style={[styles.rightHeaderButton, { backgroundColor: dark.body }]}>
                                    <Text style={[styles.buttonText, { color: dark.color }]}>{t('qrOptions')}</Text>
                                </View>
                            </View>
                            <View style={[styles.qrContainerBack, { backgroundColor: dark.body }]}>
                                <View
                                    style={styles.qrFrame}
                                    ref={(c) => {
                                        this.qr = c;
                                    }}
                                >
                                    <QRCode
                                        value={qrContent}
                                        size={width / 3}
                                        color="black"
                                        backgroundColor="transparent"
                                    />
                                </View>
                            </View>
                            <View style={[styles.multiInputContainer, { backgroundColor: dark.color }]}>
                                <MultiTextInput multiplier={this.getUnitMultiplier()} />
                            </View>
                            <View style={styles.footerButtonContainer}>
                                <TouchableOpacity
                                    style={[styles.footerButton, { backgroundColor: primary.color }]}
                                    onPress={() => this.onShareQRCodePress()}
                                >
                                    <Text style={[styles.buttonText, { color: primary.body }]}>{t('shareQr')}</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </View>
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
    isCardFlipped: state.ui.isReceiveCardFlipped,
    qrMessage: state.ui.qrMessage,
    qrAmount: state.ui.qrAmount,
    qrTag: state.ui.qrTag,
    qrDenomination: state.ui.qrDenomination,
    currency: state.settings.currency,
    usdPrice: state.marketData.usdPrice,
    conversionRate: state.settings.conversionRate,
});

const mapDispatchToProps = {
    generateNewAddress,
    generateAlert,
    getFromKeychainRequest,
    getFromKeychainSuccess,
    getFromKeychainError,
    flipReceiveCard,
};

export default translate(['receive', 'global'])(connect(mapStateToProps, mapDispatchToProps)(Receive));
